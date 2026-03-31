<<<<<<< HEAD
/**
 * Draw Engine — designed by Riya Chandra
 * 
 * I went with weighted algorithmic approach because pure random
 * felt too lottery-like. The frequency weighting makes it more
 * skill-relevant for golfers.
 * 
 * Jackpot rollover logic: if no 5-match winner, pool carries
 * forward to next month's jackpot tier only.
 */
=======
// ============================================
// Draw Engine — Golf Charity Platform
// ============================================
>>>>>>> 3fda15e (added)

export interface DrawResult {
  winningNumbers: number[];
  method: 'random' | 'algorithmic';
}

/**
 * Random draw — Standard lottery-style
 * Selects 5 unique numbers from the 1-45 Stableford range
 */
export function generateRandomDraw(): DrawResult {
  const numbers: number[] = [];
  while (numbers.length < 5) {
    const n = Math.floor(Math.random() * 45) + 1;
    if (!numbers.includes(n)) numbers.push(n);
  }
  return { winningNumbers: numbers.sort((a, b) => a - b), method: 'random' };
}

/**
 * Algorithmic draw — Weighted by score frequency
 * Uses frequency analysis of all user scores to bias the draw
 */
export function generateAlgorithmicDraw(allScores: number[]): DrawResult {
  // Count frequency of each score (1-45)
  const freq: Record<number, number> = {};
  for (let i = 1; i <= 45; i++) freq[i] = 0;
  allScores.forEach((s) => { if (s >= 1 && s <= 45) freq[s]++; });

  // Weighted selection (higher frequency = higher chance)
  const totalWeight = Object.values(freq).reduce((a, b) => a + b + 1, 0);
  const selected: number[] = [];

  while (selected.length < 5) {
    let rand = Math.random() * totalWeight;
    for (let n = 1; n <= 45; n++) {
      rand -= (freq[n] + 1);
      if (rand <= 0 && !selected.includes(n)) {
        selected.push(n);
        break;
      }
    }
    // Fallback to pure random if loop exhausted
    if (selected.length < 5) {
      for (let n = 1; n <= 45; n++) {
        if (!selected.includes(n)) { selected.push(n); break; }
      }
    }
  }

  return { winningNumbers: selected.sort((a, b) => a - b), method: 'algorithmic' };
}

/**
 * Check how many numbers a user's scores match against winning numbers
 */
export function checkMatch(userScores: number[], winningNumbers: number[]): {
  matchCount: number;
  matchType: '5-match' | '4-match' | '3-match' | null;
  matchedNumbers: number[];
} {
  const matched = userScores.filter((s) => winningNumbers.includes(s));
  const matchCount = matched.length;

  let matchType: '5-match' | '4-match' | '3-match' | null = null;
  if (matchCount === 5) matchType = '5-match';
  else if (matchCount === 4) matchType = '4-match';
  else if (matchCount === 3) matchType = '3-match';

  return { matchCount, matchType, matchedNumbers: matched };
}

/**
 * Calculate prize pools from total subscription revenue
 */
export interface PrizePool {
  total: number;
  jackpot: number; // 40%
  fourMatch: number; // 35%
  threeMatch: number; // 25%
}

export function calculatePrizePools(
  activeSubscribers: number,
  monthlyRate: number,
  rolloverAmount: number = 0
): PrizePool {
  const total = activeSubscribers * monthlyRate * 0.5; // 50% goes to prize pool
  const jackpot = total * 0.4 + rolloverAmount;
  const fourMatch = total * 0.35;
  const threeMatch = total * 0.25;

  return { total, jackpot, fourMatch, threeMatch };
}

/**
 * Calculate prize per winner in each tier
 */
export function calculatePrizePerWinner(
  pool: number,
  winnerCount: number
): number {
  if (winnerCount === 0) return 0;
  return Math.floor((pool / winnerCount) * 100) / 100; // Round down to 2dp
}

/**
 * Calculate charity contribution for a subscription
 */
export function calculateCharityContribution(
  subscriptionAmount: number,
  contributionPct: number
): number {
  return Math.round(subscriptionAmount * (contributionPct / 100) * 100) / 100;
}
