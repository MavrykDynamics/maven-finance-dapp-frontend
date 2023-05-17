import dayjs from 'dayjs'
import { SingleValueData, UTCTimestamp } from 'lightweight-charts'

import { State } from 'reducers'
import { UserState } from 'reducers/wallet'
import { Lending_Controller_History_Data, Lending_Controller_Loan_Token } from 'utils/generated/graphqlTypes'
import { Feed } from 'utils/TypesAndInterfaces/DataFeeds'
import {
  LendingItemType,
  LoansChartsDataType,
  LoanMarketType,
  BaseLoansAssetDataType,
} from 'utils/TypesAndInterfaces/Loans'

import { INPUT_STATUS_ERROR, INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'

import { parseDate } from 'utils/time'
import { convertNumberForClient, convertNumberForContractCall, getNumberInBounds } from '../../utils/calcFunctions'
import { assetDecimalsToShow } from './Loans.const'

// CONST FOR HELPERS
const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000
const ONE_WEEK_IN_MS = ONE_DAY_IN_MS * 7
const TWO_WEEK_IN_MS = ONE_DAY_IN_MS * 14

// GET ASSET METADATA
export const isTezosAsset = (tokenName: string) =>
  tokenName.toLowerCase() === 'tez' || tokenName.toLowerCase() === 'tezos' || tokenName.toLowerCase() === 'xtz'

export const getAssetMetadata = ({
  tokenName,
  tokenAddress,
  dipDupTokens,
  feeds,
  oracleId,
}: {
  tokenName: string
  tokenAddress: string
  dipDupTokens: State['tokens']['dipDupTokens']
  feeds: Array<Feed>
  oracleId?: string
}): (BaseLoansAssetDataType & { address: string }) | undefined => {
  const isXTZ = isTezosAsset(tokenName)
  const foundAssetInDipDup = dipDupTokens.find(
    ({ metadata: { name: dipDupName }, contract }) => tokenName === dipDupName || tokenAddress === contract,
  )

  const { last_completed_data, decimals, icon } = feeds.find(({ address }) => address === oracleId) ?? {}

  if (isXTZ && last_completed_data !== undefined && decimals !== undefined) {
    return {
      decimals: 6,
      gqlName: tokenName,
      name: 'Tezos',
      symbol: 'XTZ',
      icon: '/images/tezos.png',
      rate: last_completed_data / 10 ** decimals,
      address: tokenAddress,
      // TODO: ensure it's really 3
      id: 3,
    }
  }

  if (foundAssetInDipDup && last_completed_data !== undefined && decimals !== undefined) {
    return {
      decimals: Number(foundAssetInDipDup.metadata.decimals),
      gqlName: tokenName,
      name: foundAssetInDipDup.metadata.name,
      symbol: foundAssetInDipDup.metadata.symbol,
      icon:
        tokenName === 'eurl'
          ? '/images/eurl.png'
          : tokenName === 'tzbtc'
          ? '/images/tzBTC.png'
          : icon ?? foundAssetInDipDup.metadata.icon,
      rate: last_completed_data / 10 ** decimals,
      address: tokenAddress,
      id: foundAssetInDipDup.id,
    }
  }

  return
}

// NORMALIZE TRANSACTION HISTORY FOR LEND/BORROW MARKET
type TransactionHistoryReduceType = {
  transactionHistory: LoanMarketType['transactionHistory']
  lending24hVolume: number
  borrowing24hVolume: number
  marketCollateralChartData: Array<SingleValueData>
  marketLiquidityChartData: Array<SingleValueData>
}

export const getTransactionHistory = (
  history_data: Lending_Controller_History_Data[],
  dipDupTokens: State['tokens']['dipDupTokens'],
  feeds: State['dataFeeds']['feedsLedger'],
) =>
  history_data.reduce<TransactionHistoryReduceType>(
    (acc, { type, amount, timestamp, sender_id, operation_hash, loan_token, vault }) => {
      if (!loan_token) return acc

      const assetMetadata = getAssetMetadata({
        tokenAddress: loan_token.loan_token_address,
        tokenName: loan_token.loan_token_name,
        dipDupTokens,
        feeds,
        oracleId: String(loan_token.oracle_id),
      })

      if (assetMetadata) {
        const transformedAmount = amount / 10 ** assetMetadata.decimals
        const descrByType = getDescrByType(type)
        if (descrByType) {
          acc.transactionHistory.push({
            amount: transformedAmount,
            date: parseDate({ time: new Date(timestamp).getTime(), timeFormat: 'MMM Do, YYYY, HH:mm:ss UTC' }),
            userAddress: sender_id,
            vaultAddress: vault?.vault?.address,
            operationHash: operation_hash,
            descr: getDescrByType(type),
            tokenSymbol: assetMetadata.symbol,
          })
        }

        // Added liquidity (lended)
        if (type === 0) {
          if (dayjs().diff(timestamp) <= ONE_DAY_IN_MS) {
            acc.lending24hVolume += transformedAmount * assetMetadata.rate
          }

          if (dayjs().diff(timestamp) <= TWO_WEEK_IN_MS) {
            acc.marketLiquidityChartData.push({
              value: (acc.marketLiquidityChartData.at(-1)?.value ?? 0) + transformedAmount * assetMetadata.rate,
              time: new Date(timestamp).getTime() as UTCTimestamp,
            })
          }
        }

        // Removed liquidity (paid lended)
        if (type === 1) {
          if (dayjs().diff(timestamp) <= ONE_DAY_IN_MS) {
            acc.lending24hVolume -= transformedAmount * assetMetadata.rate
          }

          if (dayjs().diff(timestamp) <= TWO_WEEK_IN_MS) {
            acc.marketCollateralChartData.push({
              value: (acc.marketLiquidityChartData.at(-1)?.value ?? 0) - transformedAmount * assetMetadata.rate,
              time: new Date(timestamp).getTime() as UTCTimestamp,
            })
          }
        }

        // Borrowed
        if (type === 2) {
          if (dayjs().diff(timestamp) <= ONE_DAY_IN_MS) {
            acc.borrowing24hVolume += transformedAmount * assetMetadata.rate
          }
        }

        // Paid borrowed (repaid)
        if (type === 3) {
          if (dayjs().diff(timestamp) <= ONE_DAY_IN_MS) {
            acc.borrowing24hVolume -= transformedAmount * assetMetadata.rate
          }
        }

        // Deposit collateral
        if ((type === 4 || type === 6) && dayjs().diff(timestamp) <= TWO_WEEK_IN_MS) {
          acc.marketCollateralChartData.push({
            value: (acc.marketCollateralChartData.at(-1)?.value ?? 0) + transformedAmount * assetMetadata.rate,
            time: new Date(timestamp).getTime() as UTCTimestamp,
          })
        }

        // Withdraw collateral
        if ((type === 5 || type === 7) && dayjs().diff(timestamp) <= TWO_WEEK_IN_MS) {
          acc.marketCollateralChartData.push({
            value: (acc.marketCollateralChartData.at(-1)?.value ?? 0) - transformedAmount * assetMetadata.rate,
            time: new Date(timestamp).getTime() as UTCTimestamp,
          })
        }
      }

      return acc
    },
    {
      transactionHistory: [],
      marketCollateralChartData: [],
      marketLiquidityChartData: [],
      lending24hVolume: 0,
      borrowing24hVolume: 0,
    },
  )

// NORMALIZE CHART DATA FOR LEND/BORROW MARKETS
export const getChartData = (
  history_data: Lending_Controller_History_Data[],
  dipDupTokens: State['tokens']['dipDupTokens'],
  feeds: State['dataFeeds']['feedsLedger'],
) =>
  history_data?.reduce<LoansChartsDataType>(
    (acc, { type, amount, timestamp, loan_token }) => {
      if (!loan_token) return acc
      const assetMetadata = getAssetMetadata({
        tokenAddress: loan_token.loan_token_address,
        tokenName: loan_token.loan_token_name,
        dipDupTokens,
        feeds,
        oracleId: String(loan_token.oracle_id),
      })

      if (assetMetadata) {
        const operationTimestampAndNowDiffInMs = new Date(Date.now()).getTime() - new Date(timestamp).getTime()
        const isLast24hOperation = operationTimestampAndNowDiffInMs <= ONE_DAY_IN_MS
        const islast48hOperation =
          operationTimestampAndNowDiffInMs <= ONE_DAY_IN_MS * 2 && operationTimestampAndNowDiffInMs >= ONE_DAY_IN_MS
        const isLastWeekOperation = operationTimestampAndNowDiffInMs <= ONE_WEEK_IN_MS

        // Added liquidity (lended)
        if (type === 0) {
          const lendedAmount = (amount / 10 ** assetMetadata.decimals) * assetMetadata.rate
          if (isLast24hOperation) {
            acc.lendBorrow24hDiff.last24hLending += lendedAmount
          }

          if (islast48hOperation) {
            acc.lendBorrow24hDiff.last48hLending += lendedAmount
          }

          if (isLastWeekOperation) {
            acc.lendingChartData.push({
              time: new Date(timestamp).getTime() as UTCTimestamp,
              value: (acc.lendingChartData.at(-1)?.value ?? 0) + lendedAmount,
            })
          }
        }

        // Removed liquidity (paid lended)
        if (type === 1) {
          const lendedAmount = (amount / 10 ** assetMetadata.decimals) * assetMetadata.rate
          if (isLast24hOperation) {
            acc.lendBorrow24hDiff.last24hLending -= lendedAmount
          }

          if (islast48hOperation) {
            acc.lendBorrow24hDiff.last48hLending -= lendedAmount
          }

          if (isLastWeekOperation) {
            acc.lendingChartData.push({
              time: new Date(timestamp).getTime() as UTCTimestamp,
              value: (acc.lendingChartData.at(-1)?.value ?? 0) - lendedAmount,
            })
          }
        }

        // Borrowed
        if (type === 2) {
          const borrowedAmount = (amount / 10 ** assetMetadata.decimals) * assetMetadata.rate
          if (isLast24hOperation) {
            acc.lendBorrow24hDiff.last24hBorrowing += borrowedAmount
          }

          if (islast48hOperation) {
            acc.lendBorrow24hDiff.last48hBorrowing += borrowedAmount
          }

          if (isLastWeekOperation) {
            acc.borrowingChartData.push({
              time: new Date(timestamp).getTime() as UTCTimestamp,
              value: (acc.borrowingChartData.at(-1)?.value ?? 0) + borrowedAmount,
            })
          }
        }

        // Paid borrowed (repaid)
        if (type === 3) {
          const borrowedAmount = (amount / 10 ** assetMetadata.decimals) * assetMetadata.rate
          if (isLast24hOperation) {
            acc.lendBorrow24hDiff.last24hBorrowing -= borrowedAmount
          }

          if (islast48hOperation) {
            acc.lendBorrow24hDiff.last48hBorrowing -= borrowedAmount
          }

          if (isLastWeekOperation) {
            acc.borrowingChartData.push({
              time: new Date(timestamp).getTime() as UTCTimestamp,
              value: (acc.borrowingChartData.at(-1)?.value ?? 0) - borrowedAmount,
            })
          }
        }

        // Deposit collateral
        if (type === 4 || type === 6) {
          const collateralAmount = (amount / 10 ** assetMetadata.decimals) * assetMetadata.rate

          if (isLastWeekOperation) {
            acc.collateralChartData.push({
              value: (acc.collateralChartData.at(-1)?.value ?? 0) + collateralAmount,
              time: new Date(timestamp).getTime() as UTCTimestamp,
            })
          }
        }

        // Withdraw collateral
        if (type === 5 || type === 7) {
          const collateralAmount = (amount / 10 ** assetMetadata.decimals) * assetMetadata.rate

          if (isLastWeekOperation) {
            acc.collateralChartData.push({
              value: (acc.collateralChartData.at(-1)?.value ?? 0) - collateralAmount,
              time: new Date(timestamp).getTime() as UTCTimestamp,
            })
          }
        }
      }

      return acc
    },
    {
      borrowingChartData: [],
      collateralChartData: [],
      lendingChartData: [],
      lendBorrow24hDiff: {
        last48hLending: 0,
        last24hLending: 0,
        last48hBorrowing: 0,
        last24hBorrowing: 0,
      },
    },
  )

// GET LENDING ITEM FOR MARKET
export const getLendingItem = (
  mTokenAddress: string | null,
  userMTokens: UserState['userMTokens'],
  accountPkh?: string,
): LendingItemType => {
  if (userMTokens && mTokenAddress && accountPkh) {
    const mTokenAsset = userMTokens?.find(({ tokenAddress }) => tokenAddress === mTokenAddress)

    if (mTokenAsset) {
      return {
        lendValue: mTokenAsset.balance,
        interestEarned: mTokenAsset.rewards_earned,
        mBalance: mTokenAsset.balance + mTokenAsset.rewards_earned,
      }
    }
  }
  return null
}

// HELPER FOR LENDING APY
export const calcLendingAPY = (currentInterestRate: number, treasuryShare: number): number => {
  const secondsPerYear = 60 * 60 * 24 * 365

  const top = currentInterestRate - treasuryShare
  const firstTerm = 1 + top / secondsPerYear
  const power = firstTerm ** secondsPerYear
  return (power - 1) * 100
}

// HELPER FOR BORROW FEE
export const calculateAccruedInterest = (
  currentLoanOutstandingTotal: number,
  vaultBorrowIndex: number,
  tokenBorrowIndex: number,
) => {
  let newLoanOutstandingTotal = currentLoanOutstandingTotal
  const vBorrowIndex = vaultBorrowIndex
  const loanTokenBorrowIndex = tokenBorrowIndex

  if (currentLoanOutstandingTotal > 0) {
    if (vBorrowIndex > 0) {
      newLoanOutstandingTotal = Math.trunc((currentLoanOutstandingTotal * loanTokenBorrowIndex) / vBorrowIndex)
    }
  }

  return newLoanOutstandingTotal
}

// HELPER FOR COLLATERAL RATIO
export const calcCollateralRatio = (collateralAmount: number, borrowedAmount: number, borrowedAssetRate: number) => {
  // means we haven't borrowed anything
  if (collateralAmount === 0) return 0

  // means we haven't borrowed, but we have deposited
  if (borrowedAmount === 0) return 250

  const collateralRatio = (collateralAmount / Math.max(1, borrowedAmount * borrowedAssetRate)) * 100
  return getNumberInBounds(0, 250, Number(collateralRatio.toFixed(1)))
}

// HELPER FOR MAX COLLATERAL WITHDRAW
export const getMaxCollateralWithdraw = (
  currentCollateralAmount: number,
  totalCollateralAmount: number,
  borrowedAmount: number,
  borrowedAssetRate: number,
  collarealAssetRate: number,
): number => {
  // If vault is not borrowed we can withdraw all amount
  if (borrowedAmount === 0) return currentCollateralAmount
  /**
   * @collateralNeedsToBe is now much collateralAmount i need to left for current borrowed amount
   * 200 ratio in persent the smallest we can get, <200 vault is under collateralization
   * 100 is to transform % => number
   * (borrowedAmount * borrowedAssetRate) how much has been borrowed from the vault
   */
  const collateralNeedsToBe = (200 / 100) * (borrowedAmount * borrowedAssetRate)
  return Math.min((totalCollateralAmount - collateralNeedsToBe) / collarealAssetRate, currentCollateralAmount)
}

// HELPER TO GET OPERATION NAME BY ITS TYPE
const getDescrByType = (type: number) => {
  switch (type) {
    case 0:
      return 'Liquidity Added'
    case 1:
      return 'Liquidity Removed'
    case 2:
      return 'Borrowed'
    case 3:
      return 'Repaid'
    case 4:
      return 'Deposited'
    case 5:
      return 'Withdrawed'
    case 6:
      return 'Deposited SMVK'
    case 7:
      return 'Withdrawed SMVK'
    case 8:
      return 'Vault Created'
    case 9:
      return 'Vault Marked for Liq.'
    case 10:
      return 'Vault Liquidated'
    case 11:
      return 'Vault Closed'
    default:
      return null
  }
}

// VALIDATE LEND/BORROW POPUPS HELPERS
export const loansInputValidation = ({
  inputAmount,
  minAmount = 0,
  maxAmount,
  options = {},
}: {
  inputAmount: string
  minAmount?: number
  maxAmount: number
  options?: {
    byDecimalPlaces?: number
  }
}) => {
  const { byDecimalPlaces } = options
  const numberOfDecimalPlaces = inputAmount.match(/\.(\d+)/)?.[1].length ?? 0

  // check amount by min/max value
  if (Number(inputAmount) > minAmount && Number(inputAmount) <= maxAmount) {
    // check amount by number of decimal places
    if (byDecimalPlaces) {
      return numberOfDecimalPlaces <= byDecimalPlaces ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR
    }

    return INPUT_STATUS_SUCCESS
  }

  return INPUT_STATUS_ERROR
}

// use for get max amount for input field
// using an amount without this function will result in a validation error,
// as input is validated by the number of decimal places, and the value
// without processing may be greater
export const getLoansInputMaxAmount = (amount: number = 0, decimals: number = assetDecimalsToShow) => {
  if (!amount) return '0'

  const blockchainNumberWithoutDecimals = Math.trunc(convertNumberForContractCall({ number: amount, grade: decimals }))

  return String(convertNumberForClient({ number: blockchainNumberWithoutDecimals, grade: decimals }))
}
