import { GetLoansHistoryForMarketDataQuery, GetLoansMarketsQueryQuery } from 'utils/__generated__/graphql'
import {
  LoansContext,
  LoansContextState,
  LoansSubsRecordType,
  NullableLoansContextState,
} from '../loans.provider.types'

import { replaceNullValuesWithDefault } from 'providers/common/utils/repalceNullValuesWithDefault'
import { COLLATERAL_HISTORY_DATA_TYPES, EMPTY_LOANS_CONTEXT, LOANS_CONFIG, LOANS_MARKETS_DATA } from './loans.const'
import {
  LoansChartsType,
  LoansMarketMiniChartType,
  LoansMarketTransactionHistoryType,
  UseLoansChartsStateType,
} from './loans.types'
import { isEmptyArray, isEmptyObject } from 'utils/isEmptyValue'
import { SMVK_TOKEN_ADDRESS } from 'utils/constants'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { convertNumberForClient } from 'utils/calcFunctions'
import { parseDate } from 'utils/time'
import { TokenAddressType, TokenMetadataType } from 'providers/TokensProvider/tokens.provider.types'
import { SingleValueData } from 'lightweight-charts'

// HELPER TO GET OPERATION NAME BY ITS TYPE
export const getDescrByType = (type: number) => {
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
      return 'Withdrawn'
    case 6:
      return 'Deposited'
    case 7:
      return 'Withdrawn'
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

/**
 * CALC LENDING APY
 * @param utilizationRate     The current Utilization rate of the specific market, value between 0-1
 * @param currentInterestRate Current interest rate of the specific asset, value between 0-1
 * @param treasuryShare       How much of the interest paid is sent to the DAOs treasury
 * @returns apy of the market
 */
export const calcLendingAPY = (utilizationRate: number, currentInterestRate: number, treasuryShare: number): number => {
  // S_t = U_t * (SB_t * S_t)(1 - R_t)
  // SB_t is 1 for our module
  const leftSide = utilizationRate * currentInterestRate
  const fullSupplyAPY = leftSide * (1 - treasuryShare)
  const secondsPerYear = 60 * 60 * 24 * 365

  const top = fullSupplyAPY
  const firstTerm = 1 + top / secondsPerYear
  const power = firstTerm ** secondsPerYear
  return (power - 1) * 100
}

export const calcSupplyAPY = (utilizationRate: number, currentInterestRate: number, treasuryShare: number): number => {
  // S_t = U_t * (SB_t * S_t)(1 - R_t)
  // SB_t is 1 for our module
  const leftSide = utilizationRate * 1 * currentInterestRate
  return leftSide * (1 - treasuryShare)
}

export const calcMarketAvaliableLiquidity = ({
  total_remaining,
  token_pool_total,
  reserve_ratio,
}: Pick<
  GetLoansMarketsQueryQuery['lending_controller'][number]['loan_tokens'][number],
  'total_remaining' | 'token_pool_total' | 'reserve_ratio'
>) => {
  const reserveAmount = token_pool_total * (reserve_ratio / 10000)

  return {
    reserveAmount,
    availableLiquidity: total_remaining - reserveAmount,
    reserveFactor: reserve_ratio / 100,
  }
}

export const getLoansProviderReturnValue = ({
  loansCtxState,
  marketAddressToSubscribe,
  activeSubs,
  chartsToCalc,
  prevMarketHistoryData,
  changeLoansSubscriptionsList,
  setMarketAddressToSubscribe,
  setVaultAddressToSubscribe,
  setLoanHistoryDataFilterType,
  modifyChartsToCalc,
  prevChartsData,
  isLoansTransactionHistoryLoading,
}: {
  loansCtxState: NullableLoansContextState
  marketAddressToSubscribe: string | null
  activeSubs: LoansSubsRecordType
  chartsToCalc: LoansChartsType
  prevMarketHistoryData: LoansMarketTransactionHistoryType[] | null
  prevChartsData: UseLoansChartsStateType
  changeLoansSubscriptionsList: LoansContext['changeLoansSubscriptionsList']
  setMarketAddressToSubscribe: LoansContext['setMarketAddressToSubscribe']
  setVaultAddressToSubscribe: LoansContext['setVaultAddressToSubscribe']
  setLoanHistoryDataFilterType: LoansContext['setLoanHistoryDataFilterType']
  modifyChartsToCalc: LoansContext['modifyChartsToCalc']
  isLoansTransactionHistoryLoading: boolean
}) => {
  const { marketsMapper, marketsAddresses, config, allMarketsAddresses } = loansCtxState
  const commonToReturn = {
    changeLoansSubscriptionsList,
    setMarketAddressToSubscribe,
    setVaultAddressToSubscribe,
    setLoanHistoryDataFilterType,
    modifyChartsToCalc,
  }

  const isLoadingSingleMarket = marketAddressToSubscribe && !marketsMapper?.[marketAddressToSubscribe]
  const isLoadingAllMarkets =
    activeSubs[LOANS_MARKETS_DATA] &&
    !marketAddressToSubscribe &&
    marketsAddresses?.length !== allMarketsAddresses?.length
  const isMarketsConfigEmpty = marketsMapper === null || allMarketsAddresses === null
  /**
   * isLoading indicates whethet provider is loading smth, so we need to show loader, not load in background, cases:
   * 1,2. if we switch between markets, subscribed to 1 cetrain market and it's not loaded yet
   * 3. if we subscribe to markets and markets context data is empty
   * 4. if we subscribe to config and config context data is empty
   * 5. if we haven't subscribed to anything and don't have any data loaded, need this to fix time which component init its subscribes in useEffect as it's async operation
   */
  const isLoading =
    isLoadingSingleMarket ||
    isLoadingAllMarkets ||
    (activeSubs[LOANS_MARKETS_DATA] && isMarketsConfigEmpty) ||
    (activeSubs[LOANS_CONFIG] && config === null) ||
    (!activeSubs[LOANS_CONFIG] && config === null && !activeSubs[LOANS_MARKETS_DATA] && isMarketsConfigEmpty)

  // if provider is loading smth return loading true and default empty context (nonNullable)
  if (isLoading) {
    return {
      ...commonToReturn,
      ...EMPTY_LOANS_CONTEXT,
      allMarketsAddresses: allMarketsAddresses ?? EMPTY_LOANS_CONTEXT['allMarketsAddresses'],
      isLoading: true,
      areChartsLoading: true,
      isLoansTransactionHistoryLoading: true,
    }
  }

  const {
    calcTotalLendingChart = false,
    calcTotalBorrowingChart = false,
    calcTotalCollateralChart = false,
    calcMarketBorrowChart = false,
    calcMarketLendingChart = false,
  } = chartsToCalc

  const { totalLendingChart, totalBorrowingChart, totalCollateralChart, marketBorrowChart, marketLendingChart } =
    prevChartsData

  const _areChartsLoading =
    (calcTotalLendingChart && totalLendingChart.length === 0) ||
    (calcTotalBorrowingChart && totalBorrowingChart.length === 0) ||
    (calcTotalCollateralChart && totalCollateralChart.length === 0) ||
    (calcMarketBorrowChart && isEmptyObject(marketBorrowChart)) ||
    (calcMarketLendingChart && isEmptyObject(marketLendingChart))

  // if subscribed data loaded return loading false and contextState where all null values replaced with nonNullable value
  const nonNullableProviderValue = replaceNullValuesWithDefault<LoansContextState>(loansCtxState, EMPTY_LOANS_CONTEXT)

  const turnOffLoansTransactionHistotyDataLoader = isLoansTransactionHistoryLoading && prevMarketHistoryData

  return {
    ...commonToReturn,
    ...nonNullableProviderValue,
    // prevMarketHistoryData
    loansTransactionHistoryData: turnOffLoansTransactionHistotyDataLoader
      ? prevMarketHistoryData
      : nonNullableProviderValue.loansTransactionHistoryData,
    isLoading: false,
    areChartsLoading: _areChartsLoading,
    isLoansTransactionHistoryLoading: isLoansTransactionHistoryLoading
      ? !turnOffLoansTransactionHistotyDataLoader
      : isLoansTransactionHistoryLoading,
  }
}

export const normalizeTransactionHistory = (
  data: GetLoansHistoryForMarketDataQuery,
  tokensMetadata: Record<string, TokenMetadataType>,
  tokensPrices: Record<string, number>,
) => {
  return data.lending_controller[0].history_data.reduce<Array<LoansMarketTransactionHistoryType>>(
    (
      acc,
      {
        type,
        amount,
        timestamp,
        vault,
        sender: { address: senderAddress },
        operation_hash,
        loan_token,
        collateral_token,
      },
    ) => {
      if (!loan_token) return acc
      const loanTokenAddress = loan_token.token.token_address
      const collateralTokenAddress = collateral_token?.token.token_address
      const isSmvkCollateral = collateral_token?.token.mvk_tokens.length

      const tokenAddress =
        COLLATERAL_HISTORY_DATA_TYPES.includes(type) && collateralTokenAddress
          ? isSmvkCollateral
            ? SMVK_TOKEN_ADDRESS
            : collateralTokenAddress
          : loanTokenAddress

      const token = getTokenDataByAddress({ tokenAddress, tokensMetadata, tokensPrices })

      if (!token || !token.rate) return acc

      const { symbol, decimals, rate } = token

      const convertedAmount = convertNumberForClient({ number: amount, grade: decimals })
      const amountInUsd = convertedAmount * rate

      const transactionHistoryItem: LoansMarketTransactionHistoryType = {
        amount: convertedAmount,
        usdValue: amountInUsd,
        tokenAddress,
        symbol,
        date: parseDate({ time: new Date(timestamp).getTime(), timeFormat: 'MMM Do, YYYY, HH:mm:ss UTC' }),
        vaultAddress: vault?.vault?.address,
        userAddress: senderAddress,
        operationHash: operation_hash,
        descr: getDescrByType(type),
      }

      acc.push(transactionHistoryItem)

      return acc
    },
    [],
  )
}

export function isChartsDataHasEmptyValues(data: UseLoansChartsStateType) {
  return Object.values(data).some((v) => isEmptyObject(v) || isEmptyArray(v))
}

type UseLoansChartsStateTypeShape = {
  [key: string]: SingleValueData[] | Record<TokenAddressType, LoansMarketMiniChartType>
}

export const replaceNonEmptyChartsData = (
  prevData: UseLoansChartsStateTypeShape,
  data: UseLoansChartsStateTypeShape,
) => {
  const result: UseLoansChartsStateTypeShape = { ...prevData }

  Object.entries(data).forEach(([key, value]) => {
    if (
      !(Array.isArray(value) && value.every((el) => el.value === 0)) &&
      !isEmptyArray(value) &&
      !isEmptyObject(value)
    ) {
      result[key] = value
    }
  })

  // need to use "as" to tell ts that's the correct object
  return result as UseLoansChartsStateType
}
