import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { generateWinningNumbers, runDraw, calculatePrizePool } from '@/lib/draw/algorithm'

export async function POST(req: Request) {
  try {
    const supabase = await createAdminClient()
    const { algorithm } = await req.json()
    
    // Check if draw already running/pending for this month
    const thisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
    const { data: existing } = await supabase.from('draws').select('*').eq('month', thisMonth).single()
    
    if (existing && existing.status !== 'pending') {
      return new NextResponse('Draw already executed for this month', { status: 400 })
    }

    // 1. Get total active subscribers
    const { data: subs } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('status', 'active')
    
    const activeSubCount = subs?.length || 0
    if (activeSubCount === 0) return new NextResponse('No active subscribers to draw', { status: 400 })
    
    const userIds = subs?.map(s => s.user_id) || []

    // 2. Compute pool
    const { data: lastDraw } = await supabase.from('draws').select('rollover_amount').order('month', { ascending: false }).limit(1).single()
    const rollover = lastDraw?.rollover_amount || 0
    const prizePool = calculatePrizePool(activeSubCount, 9.99, rollover)

    // 3. Generate Numbers
    const winningNumbers = generateWinningNumbers(algorithm || 'random')

    // 4. Fetch scores for all active users (limit 5)
    // Supabase RPC trick: we already enforce 5 max in the DB trigger, so we can just grab them
    const { data: scoresData } = await supabase
      .from('scores')
      .select('user_id, score')
      .in('user_id', userIds)

    // Group scores by user
    const userScores: Record<string, number[]> = {}
    scoresData?.forEach(row => {
      if (!userScores[row.user_id]) userScores[row.user_id] = []
      userScores[row.user_id].push(row.score)
    })

    const subscribersArray = Object.keys(userScores).map(uid => ({
      userId: uid,
      scores: userScores[uid]
    }))

    // 5. Run draw logic
    const { results, newRollover } = runDraw(winningNumbers, subscribersArray, prizePool, rollover)

    // 6. DB Transaction (using admin client insertion)
    let drawId = existing?.id

    if (!drawId) {
      const { data: newDraw, error: drawErr } = await supabase.from('draws').insert({
        month: thisMonth,
        algorithm,
        status: 'running',
        jackpot_pool: prizePool.jackpot,
        rollover_amount: newRollover,
        winning_numbers: winningNumbers,
        total_pool: prizePool.total
      }).select().single()
      
      if (drawErr) throw drawErr
      drawId = newDraw.id
    } else {
      await supabase.from('draws').update({
        algorithm,
        status: 'running',
        jackpot_pool: prizePool.jackpot,
        rollover_amount: newRollover,
        winning_numbers: winningNumbers,
        total_pool: prizePool.total
      }).eq('id', drawId)
    }

    // Delete any previous results for this draw (if it was rerun)
    await supabase.from('draw_results').delete().eq('draw_id', drawId)

    // Insert new results
    if (results.length > 0) {
      const resultsToInsert = results.map(r => ({
        draw_id: drawId,
        user_id: r.userId,
        match_count: r.matchCount,
        prize_amount: r.prizeAmount,
        status: 'pending'
      }))
      await supabase.from('draw_results').insert(resultsToInsert)
    }

    return NextResponse.json({ success: true, drawId, winners: results.length, pool: prizePool.total })
  } catch (err: any) {
    console.error('Run draw error:', err)
    return new NextResponse(`Error: ${err.message}`, { status: 500 })
  }
}
