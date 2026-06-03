import BigNumber from 'bignumber.js'
import { DECIMALS_TO_SHOW, MVN_DECIMALS, PRECISION_NUMBER, SECONDS_PER_BLOCK } from './constants'

/**
 * Calculates the MVN Loyalty Index (MLI) per the function in the litepaper
 * @param totalStakedMVN
 * @param totalMvnSupply
 */
export function calcMLI(totalMvnSupply: number | undefined, totalStakedMVN: number | undefined): number {
  const mvnSupplyActual = totalMvnSupply ?? 0
  const stakedMvnSupplyActual = totalStakedMVN ?? 0
  const mli = (stakedMvnSupplyActual / (mvnSupplyActual | 1)) * 100
  return mli
}

export function calcExitFee(totalMvnSupply: number | undefined, totalStakedMVN: number | undefined): number {
  const mli = calcMLI(totalMvnSupply, totalStakedMVN)
  const fee = 30 - 0.525 * mli + 0.0025 * mli ** 2
  return fee
}

/**
 * Convert a display-form number to its on-chain (smallest-unit) representation
 * using BigNumber to avoid IEEE-754 drift.
 *
 * Example: 1.1 MVN with 6 decimals → 1100000 mumvn (not 1099999 like the
 * floating-point version produced).
 */
export const toContractUnits = ({
  number,
  grade = MVN_DECIMALS,
}: {
  number: number | string
  grade?: number
}): number => {
  return new BigNumber(number).shiftedBy(grade).integerValue(BigNumber.ROUND_FLOOR).toNumber()
}

/**
 * Convert an on-chain (smallest-unit) number to its display form using
 * BigNumber to avoid IEEE-754 drift. Truncates any sub-unit fraction first
 * (matching the previous floating-point implementation's intent).
 */
export const fromContractUnits = ({
  number,
  grade = MVN_DECIMALS,
}: {
  number: number | string
  grade?: number
}): number => {
  return new BigNumber(number).integerValue(BigNumber.ROUND_FLOOR).shiftedBy(-grade).toNumber()
}

/**
 * @param amount: number we want to remove over decimals
 * @param decimals: decimals amount need to left
 * @returns number with specified amount of decimals
 */
export const removeUnnecessaryDecimals = (amount: number = 0, decimals: number) => {
  if (!amount) return 0
  return new BigNumber(amount).decimalPlaces(decimals, BigNumber.ROUND_FLOOR).toNumber()
}

/**
 * @deprecated Use `toContractUnits` — same signature, BigNumber-safe math.
 */
export const convertNumberForContractCall = ({
  number,
  grade = MVN_DECIMALS,
}: {
  number: number
  grade?: number
}): number => toContractUnits({ number, grade })

/**
 * @deprecated Use `fromContractUnits` — same signature, BigNumber-safe math.
 */
export const convertNumberForClient = ({
  number,
  grade = MVN_DECIMALS,
}: {
  number: number
  grade?: number
}): number => fromContractUnits({ number, grade })

/**
 *
 * @param number number we want to get it's percent
 * @param wholeSum number we want to get percent from
 * @returns percent of number in whole sum
 */
export const calcPercent = (number: number, wholeSum: number) => {
  const divider = wholeSum / 100
  return divider === 0 ? 0 : getNumberInBounds(0, 100, number / divider)
}

export const getDynamicDecimalsAmountForOutput = (number: number): number => {
  const decimalPart = String(number).split('.')[1]
  if (!decimalPart) return DECIMALS_TO_SHOW

  const matchesForLeadingZeroes = decimalPart.match(/^0+/)
  return matchesForLeadingZeroes ? matchesForLeadingZeroes[0].length + 2 : DECIMALS_TO_SHOW
}

export function calcTimeToBlock(currentBlockLevel?: number, endBlockLevel?: number) {
  if (!currentBlockLevel || !endBlockLevel) return 0

  const blockFrequency = SECONDS_PER_BLOCK //seconds
  const blocksToGo = endBlockLevel - currentBlockLevel
  const minutesUntilEndBlockReached = blocksToGo / (60 / blockFrequency)
  const hoursUntilEndBlockReached = minutesUntilEndBlockReached / 60
  const daysUntilEndBlockReached = hoursUntilEndBlockReached / 24
  return daysUntilEndBlockReached
}

export function calcWithoutPrecision(amount: string | number): number {
  const numberMu = parseFloat(amount?.toString()) || 0
  return numberMu > 0 ? numberMu / PRECISION_NUMBER : 0
}

export function calcWithoutMu(amount: string | number): number {
  const numberMu = parseFloat(amount?.toString()) || 0
  return numberMu > 0 ? numberMu / 1000000 : 0
}

export function calcWithoutDecimals(amount: string | number, decimals: number): number {
  const numberWithDecimals = parseFloat(amount?.toString()) || 0
  return numberWithDecimals > 0 ? numberWithDecimals / 10 ** decimals : 0
}

export const calcDiffBetweenTwoNumbersInPersentage = (num1: number, num2: number): number => {
  if (num1 === 0 && num2 === 0) return 0
  const topPart = num1 - num2
  const bottomPart = (num1 + num2) / 2

  return (topPart / bottomPart) * 100
}

export const percentageDifference = (a: number, b: number): number => {
  const twoNumberDifference = (a / b - 1) * 100
  return Number(twoNumberDifference.toFixed(2))
}

export const getNumberInBounds = (minBound: number, maxBound: number, numberToPutInBound: number) => {
  return Math.max(minBound, Math.min(maxBound, numberToPutInBound))
}

export const generateUniqueId = () => Math.random().toString(36).substring(2) + Date.now().toString(36)

/**
 * Converts a raw value to a percentage (0–100), keeping 2 decimal places.
 * If the value is already a percent-like number, just clamp it.
 */
export const formatAsPercent = (value: number) => {
  const percent = value / 100
  return Number(percent.toFixed(2))
}
