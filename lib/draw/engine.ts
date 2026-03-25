import { createAdminClient } from '@/lib/supabase/server'

interface DrawResult {
  userId: string
  matchCount: number
  prizeAmount: number
}

export async function runDrawEngine(simulation = true) {
  const supabase = await createAdminClient()

  // 1. Get current month
  const now = new Date()
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]

  // 2. Generate 5 winning numbers (1-45)
  const winningNumbers: number[] = []
  while (winningNumbers.length < 5) {
    const num = Math.floor(Math.random() * 45) + 1
    if (!winningNumbers.includes(num)) winningNumbers.push(num)
  }

  // 3. Fetch active subscribers
  const { data: activeSubs } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('status', 'active')

  if (!activeSubs || activeSubs.length === 0) {
    return { error: 'No active subscribers found' }
  }

  const userIds = activeSubs.map(s => s.user_id)

  // 4. Fetch last 5 scores for each user
  const { data: scores } = await supabase
    .from('scores')
    .select('user_id, score')
    .in('user_id', userIds)
    .order('played_at', { ascending: false })

  // 5. Group scores and find winners
  const userResults: Record<string, number[]> = {}
  scores?.forEach(s => {
    if (!userResults[s.user_id]) userResults[s.user_id] = []
    if (userResults[s.user_id].length < 5) userResults[s.user_id].push(s.score)
  })

  const winners: DrawResult[] = []
  const matches = { 5: 0, 4: 0, 3: 0 }

  for (const userId of userIds) {
    const userScores = userResults[userId] || []
    if (userScores.length < 5) continue

    let matchCount = 0
    userScores.forEach(s => {
      if (winningNumbers.includes(s)) matchCount++
    })

    if (matchCount >= 3) {
      winners.push({ userId, matchCount, prizeAmount: 0 })
      matches[matchCount as 3 | 4 | 5]++
    }
  }

  // 6. Calculate Prize Pool
  const contributionPerUser = 500
  const totalPool = activeSubs.length * contributionPerUser

  const { data: lastDraw } = await supabase
    .from('draws')
    .select('rollover_amount')
    .eq('status', 'published')
    .order('month', { ascending: false })
    .limit(1)
    .single()

  const rolloverFromLast = lastDraw?.rollover_amount || 0
  const currentJackpot = totalPool + Number(rolloverFromLast)

  const pool5 = currentJackpot * 0.40
  const pool4 = currentJackpot * 0.35
  const pool3 = currentJackpot * 0.25

  const winnersWithAmounts = winners.map(w => {
    let amount = 0
    if (w.matchCount === 5) amount = pool5 / (matches[5] || 1)
    else if (w.matchCount === 4) amount = pool4 / (matches[4] || 1)
    else if (w.matchCount === 3) amount = pool3 / (matches[3] || 1)
    
    if (matches[w.matchCount as 3 | 4| 5] === 0) amount = 0

    return { ...w, prizeAmount: Number(amount.toFixed(2)) }
  })

  let rolloverToNext = 0
  if (matches[5] === 0) rolloverToNext += pool5
  if (matches[4] === 0) rolloverToNext += pool4
  if (matches[3] === 0) rolloverToNext += pool3

  const result = {
    month: currentMonth,
    winningNumbers,
    totalPool,
    jackpotPool: currentJackpot,
    winners: winnersWithAmounts,
    matches,
    rolloverAmount: Number(rolloverToNext.toFixed(2)),
  }

  if (!simulation) {
    const { data: draw, error: drawErr } = await supabase
      .from('draws')
      .insert({
        month: currentMonth,
        winning_numbers: winningNumbers,
        total_pool: totalPool,
        jackpot_pool: currentJackpot,
        rollover_amount: rolloverToNext,
        status: 'published'
      })
      .select()
      .single()

    if (drawErr) throw drawErr

    if (winnersWithAmounts.length > 0) {
      const { error: resErr } = await supabase
        .from('draw_results')
        .insert(winnersWithAmounts.map(w => ({
          draw_id: draw.id,
          user_id: w.userId,
          match_count: w.matchCount,
          prize_amount: w.prizeAmount,
          status: 'pending'
        })))
      
      if (resErr) throw resErr
    }
  }

  return result
}
