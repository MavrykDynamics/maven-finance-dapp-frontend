import {DECIMALS_TO_SHOW, MVN_DECIMALS, PRECISION_NUMBER, SECONDS_PER_BLOCK} from './constants'

/**
 * Calculates the MVK Loyalty Index (MLI) per the function in the litepaper
 * @param totalStakedMVK
 * @param totalMvkSupply
 */
export function calcMLI(totalMvkSupply: number | undefined, totalStakedMVK: number | undefined): number {
  const mvkSupplyActual = totalMvkSupply ?? 0
  const stakedMvkSupplyActual = totalStakedMVK ?? 0
  const mli = (stakedMvkSupplyActual / (mvkSupplyActual | 1)) * 100
  return mli
}

export function calcExitFee(totalMvkSupply: number | undefined, totalStakedMVK: number | undefined): number {
  const mli = calcMLI(totalMvkSupply, totalStakedMVK)
  const fee = 30 - 0.525 * mli + 0.0025 * mli ** 2
  return fee
}

/**
 * @param amount: nubmer we want to remove over decimals
 * @param decimals: decimals amount need to left
 * @returns number with specified amount of decimals
 */
export const removeUnnessesaryDecimals = (amount: number = 0, decimals: number) => {
  if (!amount) return 0

  const blockchainNumberWithoutDecimals = Math.trunc(convertNumberForContractCall({ number: amount, grade: decimals }))

  return convertNumberForClient({ number: blockchainNumberWithoutDecimals, grade: decimals })
}

/**
 * @param number -> number in regular form that we wan't to convert for usage in contract call
 * @param grade -> grade for 10, that we'll need to multiply number to convert it for usage in contract call
 *
 * By default fn will use MVK decimals amount
 * Math.trunc is used to remove decimals that are more that allowed amount for token
 */
export const convertNumberForContractCall = ({
  number,
  grade = MVN_DECIMALS,
}: {
  number: number
  grade?: number
}): number => {
  return Math.trunc(number * Math.pow(10, grade))
}

/**
 * @param number -> number in contract form that we wan't to convert for usage on client output
 * @param grade -> grade for 10, that we'll need to divide number to convert it for usage on client
 *
 * contract number form is number without decimals, this form is reached by multiplying reqular number by 10^(decimals amount different between different types of tokens)
 *
 * By default fn will use MVK decimals amount
 */
export const convertNumberForClient = ({
  number,
  grade = MVN_DECIMALS,
}: {
  number: number
  grade?: number
}): number => {
  return Math.trunc(number) / Math.pow(10, grade)
}

/**
 *
 * @param number number we want to get it's persent
 * @param wholeSum number we wan't to get persent from
 * @returns persent of number in whole sum
 */
export const calcPersent = (number: number, wholeSum: number) => {
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
