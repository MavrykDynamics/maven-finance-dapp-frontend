import { GetLoansMarketsSubscriptionSubscription } from 'utils/__generated__/graphql'
import { LoansContext, LoansContextState, LoansSubsRecordType } from '../loans.provider.types'

import { replaceNullValuesWithDefault } from 'providers/common/utils/repalceNullValuesWithDefault'
import { EMPTY_LOANS_CONTEXT, LOANS_CONFIG, LOANS_MARKETS_DATA } from './loans.const'

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
      return 'Deposited SMVK'
    case 7:
      return 'Withdrew SMVK'
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

// HELPER FOR LENDING APY
export const calcLendingAPY = (currentInterestRate: number, treasuryShare: number): number => {
  const secondsPerYear = 60 * 60 * 24 * 365

  const top = currentInterestRate - treasuryShare
  const firstTerm = 1 + top / secondsPerYear
  const power = firstTerm ** secondsPerYear
  return (power - 1) * 100
}

export const calcMarketAvaliableLiquidity = ({
  total_remaining,
  token_pool_total,
  reserve_ratio,
}: Pick<
  GetLoansMarketsSubscriptionSubscription['lending_controller'][number]['loan_tokens'][number],
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
  changeLoansSubscriptionsList,
  setMarketAddressToSubscribe,
}: {
  loansCtxState: LoansContextState
  marketAddressToSubscribe: string | null
  activeSubs: LoansSubsRecordType
  changeLoansSubscriptionsList: LoansContext['changeLoansSubscriptionsList']
  setMarketAddressToSubscribe: LoansContext['setMarketAddressToSubscribe']
}) => {
  const { marketsMapper, marketsAddresses, config, allMarketsAddresses } = loansCtxState
  const commonToReturn = {
    changeLoansSubscriptionsList,
    setMarketAddressToSubscribe,
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
