// @ts-nocheck

import {
  LoansContext,
  LoansContextState,
  LoansSubsRecordType,
  MarketsIndexerDataType,
  NullableLoansContextState,
} from '../loans.provider.types'

import {replaceNullValuesWithDefault} from 'providers/common/utils/repalceNullValuesWithDefault'
import {EMPTY_LOANS_CONTEXT, LOANS_CONFIG, LOANS_MARKETS_DATA} from './loans.const'

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

export const calcMarketAvailableLiquidity = ({
  total_remaining,
  token_pool_total,
  reserve_ratio,
}) => {
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
  changeLoansSubscriptionsList,
  setMarketAddressToSubscribe,
  setLoansChartsData,
}: {
  loansCtxState: NullableLoansContextState
  marketAddressToSubscribe: string | null
  activeSubs: LoansSubsRecordType
  changeLoansSubscriptionsList: LoansContext['changeLoansSubscriptionsList']
  setMarketAddressToSubscribe: LoansContext['setMarketAddressToSubscribe']
  setLoansChartsData: LoansContext['setLoansChartsData']
}) => {
  const { marketsMapper, marketsAddresses, config, allMarketsAddresses } = loansCtxState
  const commonToReturn = {
    changeLoansSubscriptionsList,
    setMarketAddressToSubscribe,
    setLoansChartsData,
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
    }
  }

  // if subscribed data loaded return loading false and contextState where all null values replaced with nonNullable value
  const nonNullableProviderValue = replaceNullValuesWithDefault<LoansContextState>(loansCtxState, EMPTY_LOANS_CONTEXT)
  return {
    ...commonToReturn,
    ...nonNullableProviderValue,
    isLoading: false,
  }
}
