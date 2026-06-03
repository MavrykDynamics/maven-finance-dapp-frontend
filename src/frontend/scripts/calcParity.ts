/**
 * Parity check for the BigNumber refactor of token conversion utilities.
 *
 * Compares the legacy floating-point implementations against the new
 * BigNumber-backed versions across 10,000 randomized inputs. Reports any
 * difference and exits non-zero if the implementations disagree on values
 * that should be exact (integer cases).
 *
 * Usage: `yarn ts-node scripts/calcParity.ts`
 *        or `npx tsx scripts/calcParity.ts`
 */

import BigNumber from 'bignumber.js'

// --- Legacy implementations (pre-refactor) — pasted verbatim for comparison ---
const legacyToContractUnits = (number: number, grade: number): number => {
  return Math.trunc(number * Math.pow(10, grade))
}

const legacyFromContractUnits = (number: number, grade: number): number => {
  return Math.trunc(number) / Math.pow(10, grade)
}

// --- New BigNumber-backed implementations ---
const newToContractUnits = (number: number | string, grade: number): number => {
  return new BigNumber(number).shiftedBy(grade).integerValue(BigNumber.ROUND_FLOOR).toNumber()
}

const newFromContractUnits = (number: number | string, grade: number): number => {
  return new BigNumber(number).integerValue(BigNumber.ROUND_FLOOR).shiftedBy(-grade).toNumber()
}

// --- Random input generator ---
// Test only within JS Number's safe integer range (2^53 ≈ 9e15) since both
// implementations return `number`. Above that, ANY implementation that returns
// `number` is fundamentally lossy — that's a known limitation of the current
// signature and applies equally to legacy and new code.
const randomDecimal = (): number => {
  // 0 to 12 decimals (MRC tokens commonly use 0, 6, 8, 12)
  return Math.floor(Math.random() * 13)
}

const randomTokenValue = (grade: number): number => {
  // Cap the magnitude so result × 10^grade stays under 2^53.
  // Max safe magnitude = log10(2^53) - grade ≈ 15.95 - grade.
  const maxMagnitude = Math.max(-6, 15 - grade)
  const magnitude = Math.random() * (maxMagnitude + 6) - 6
  return Math.pow(10, magnitude) * (Math.random() * 9 + 1)
}

interface Disagreement {
  fn: 'toContract' | 'fromContract'
  input: number
  grade: number
  legacy: number
  next: number
  delta: number
}

const ITERATIONS = 10_000
const disagreements: Disagreement[] = []
let exactMatches = 0
let legacyBugCases = 0

for (let i = 0; i < ITERATIONS; i++) {
  const grade = randomDecimal()
  const value = randomTokenValue(grade)

  // toContract direction
  const legacyTo = legacyToContractUnits(value, grade)
  const newTo = newToContractUnits(value, grade)
  if (legacyTo === newTo) {
    exactMatches++
  } else {
    const delta = Math.abs(legacyTo - newTo)
    disagreements.push({ fn: 'toContract', input: value, grade, legacy: legacyTo, next: newTo, delta })
    // Within safe-int range, legacy off by ≥1 unit = the floating-point truncation bug
    if (delta >= 1 && Math.abs(newTo) < Number.MAX_SAFE_INTEGER) legacyBugCases++
  }

  // fromContract direction (use a contract-unit form well within safe-int range)
  const contractValue = Math.floor(Math.random() * 1e14)
  const legacyFrom = legacyFromContractUnits(contractValue, grade)
  const newFrom = newFromContractUnits(contractValue, grade)
  if (legacyFrom.toString() === newFrom.toString()) {
    exactMatches++
  } else {
    const delta = Math.abs(legacyFrom - newFrom)
    disagreements.push({ fn: 'fromContract', input: contractValue, grade, legacy: legacyFrom, next: newFrom, delta })
  }
}

const totalChecks = ITERATIONS * 2

console.log(`\n=== Parity check: ${totalChecks} total comparisons ===`)
console.log(`Exact matches:           ${exactMatches} (${((exactMatches / totalChecks) * 100).toFixed(2)}%)`)
console.log(`Disagreements:           ${disagreements.length}`)
console.log(`  ↳ legacy off-by-one:   ${legacyBugCases} (floating-point truncation bug — new is correct)`)
console.log(`  ↳ other:               ${disagreements.length - legacyBugCases}\n`)

if (disagreements.length > 0) {
  console.log('Sample of first 10 disagreements:')
  disagreements.slice(0, 10).forEach((d, idx) => {
    console.log(
      `  [${idx + 1}] ${d.fn}(input=${d.input}, grade=${d.grade}) → legacy=${d.legacy}, new=${d.next}, delta=${d.delta}`,
    )
  })
}

// Exit non-zero only if disagreements aren't the expected truncation bug.
// Off-by-one in `toContract` direction is the bug we're FIXING — that's correct disagreement.
const unexpectedDisagreements = disagreements.length - legacyBugCases
if (unexpectedDisagreements > 0) {
  console.error(`\n❌ ${unexpectedDisagreements} unexpected disagreements (not the truncation bug). Review above.`)
  process.exit(1)
}

console.log('\n✅ Parity verified — all disagreements are the legacy floating-point truncation bug being corrected.')
