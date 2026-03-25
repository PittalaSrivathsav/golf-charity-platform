/**
 * Draw Algorithm
 * Generates 5 winning Stableford scores and matches them against subscriber scores
 */

export type DrawAlgorithm = 'random' | 'weighted'

// Common Stableford score distribution (weighted towards 2-3)
const WEIGHTED_DISTRIBUTION = [
  ...Array(2).fill(1),
  ...Array(5).fill(2),
  ...Array(8).fill(3),
  ...Array(8).fill(4),
  ...Array(7).fill(5),
  ...Array(6).fill(6),
  ...Array(4).fill(7),
  ...Array(3).fill(8),
  ...Array(2).fill(9),
  ...Array(2).fill(10),
  ...Array(1).fill(11),
  ...Array(1).fill(12),
]

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function generateWinningNumbers(algorithm: DrawAlgorithm = 'random'): number[] {
  const numbers: Set<number> = new Set()

  while (numbers.size < 5) {
    let num: number
    if (algorithm === 'weighted') {
      num = WEIGHTED_DISTRIBUTION[Math.floor(Math.random() * WEIGHTED_DISTRIBUTION.length)]
    } else {
      num = getRandomInt(1, 45)
    }
    numbers.add(num)
  }

  return Array.from(numbers).sort((a, b) => a - b)
}

export function countMatches(userScores: number[], winningNumbers: number[]): number {
  const winningSet = new Set(winningNumbers)
  return userScores.filter(score => winningSet.has(score)).length
}

export interface PrizePool {
  total: number
  jackpot: number    // 40% for 5-match
  fourMatch: number  // 35% for 4-match
  threeMatch: number // 25% for 3-match
}

export function calculatePrizePool(
  activeSubscribers: number,
  monthlyPrice: number = 9.99,
  rolloverAmount: number = 0
): PrizePool {
  const total = (activeSubscribers * monthlyPrice) + rolloverAmount
  return {
    total,
    jackpot: total * 0.40,
    fourMatch: total * 0.35,
    threeMatch: total * 0.25,
  }
}

export interface DrawResult {
  userId: string
  scores: number[]
  matchCount: number
  prizeAmount: number
}

export function runDraw(
  winningNumbers: number[],
  subscribers: Array<{ userId: string; scores: number[] }>,
  prizePool: PrizePool,
  rolloverAmount: number = 0
): {
  results: DrawResult[]
  newRollover: number
} {
  const fiveMatch: string[] = []
  const fourMatch: string[] = []
  const threeMatch: string[] = []
  const allResults: DrawResult[] = []

  for (const sub of subscribers) {
    const matchCount = countMatches(sub.scores, winningNumbers)
    if (matchCount === 5) fiveMatch.push(sub.userId)
    else if (matchCount === 4) fourMatch.push(sub.userId)
    else if (matchCount === 3) threeMatch.push(sub.userId)

    if (matchCount >= 3) {
      allResults.push({
        userId: sub.userId,
        scores: sub.scores,
        matchCount,
        prizeAmount: 0, // computed below
      })
    }
  }

  let newRollover = rolloverAmount

  // Assign prize amounts
  for (const result of allResults) {
    if (result.matchCount === 5) {
      result.prizeAmount = fiveMatch.length > 0
        ? prizePool.jackpot / fiveMatch.length
        : 0
    } else if (result.matchCount === 4) {
      result.prizeAmount = fourMatch.length > 0
        ? prizePool.fourMatch / fourMatch.length
        : 0
    } else if (result.matchCount === 3) {
      result.prizeAmount = threeMatch.length > 0
        ? prizePool.threeMatch / threeMatch.length
        : 0
    }
  }

  // Rollover jackpot if no 5-match winner
  if (fiveMatch.length === 0) {
    newRollover = (rolloverAmount || 0) + prizePool.jackpot
  } else {
    newRollover = 0
  }

  return { results: allResults, newRollover }
}
