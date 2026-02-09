// @ts-nocheck
import React, { useCallback, useContext, useMemo, useState } from 'react'

// hooks
import { useQueryProvider } from 'providers/QueryProvider/query.provider'
import { useGraphQLQuery, useGraphQLQueryOnce } from 'providers/QueryProvider/useGraphQLQuery'

// types
import { LoansChartsType, LoansContext, LoansSubsRecordType, NullableLoansContextState } from './loans.provider.types'
import { TokenAddressType } from 'providers/TokensProvider/tokens.provider.types'

// consts
import { GET_ALL_MARKETS_QUERY, GET_LOANS_CONFIG, GET_MARKET_BY_ADDRESS_QUERY } from './queries/loansMarkets.query'
import {
  DEFAULT_LOANS_ACTIVE_SUBS,
  DEFAULT_LOANS_CONTEXT,
  LOANS_CONFIG,
  LOANS_MARKETS_DATA,
} from './helpers/loans.const'

// helpers
import {
  normalizeLoansConfig,
  normalizeLoansMarkets,
  normalizeLoansMarketsNew,
} from './helpers/loansMarkets.normalizer'
import { getLoansProviderReturnValue } from './helpers/loans.utils'

export const loansContext = React.createContext<LoansContext>(undefined!)

type Props = {
  children: React.ReactNode
}

/**
 * NOTES:
 *    Single market sub: need to use SATELLITES_DATA_SINGLE_SUB sub type along with providing satellite addres
 *    via setSatelliteAddressToSubsctibe, if this address is from indexer (userAddress, when isSatelliteTrue, or satelliteDelegatedTo)
 *    you don't need to check whether satellite exists, if address can be modified by user, or we not sure whether satellite exists, we need to check it first
 *    with apolloClient and CHECK_WHETHER_SATELLITE_EXISTS query, othervise if satellite is not exists it will show infinity loader
 */
export const LoansProvider = ({ children }: Props) => {
  const { handleQueryError } = useQueryProvider()

  const [activeSubs, setActiveSubs] = useState<LoansSubsRecordType>(DEFAULT_LOANS_ACTIVE_SUBS)
  const [marketAddressToSubscribe, setMarketAddressToSubscribe] = useState<null | TokenAddressType>(null)
  const [loansCtxState, setLoansCtxState] = useState<NullableLoansContextState>(DEFAULT_LOANS_CONTEXT)

  /**
   * GET_LOANS_CONFIG -> load lending controller config
   * GET_MARKET_BY_ADDRESS_QUERY -> load market by address
   * GET_ALL_MARKETS_QUERY -> load all loans markets
   */
  useGraphQLQueryOnce(GET_LOANS_CONFIG, {
    skip: !activeSubs[LOANS_CONFIG],
    variables: {},
    onCompleted: (data) => {
      setLoansCtxState((prev) => ({
        ...prev,
        config: normalizeLoansConfig({ indexerData: data }),
      }))
    },
    onError: (error) => {
      handleQueryError(error, 'GET_LOANS_CONFIG')
      setLoansCtxState((prev) => ({
        ...prev,
        config: prev.config ?? { daoFee: 0, collateralFactor: 0, liquidationFactor: 0 },
      }))
    },
  })

  useGraphQLQuery(GET_MARKET_BY_ADDRESS_QUERY, {
    skip: !activeSubs[LOANS_MARKETS_DATA] || !marketAddressToSubscribe,
    variables: {
      marketTokenAddress: marketAddressToSubscribe ?? '',
    },
    onCompleted: (data) => {
      const newMarkets = normalizeLoansMarkets({ indexerData: data })

      setLoansCtxState((prev) => ({
        ...prev,
        allMarketsAddresses: data.allMarketsAddresses[0].loan_tokens.map(
          ({ token: { token_address } }) => token_address,
        ),
        marketsMapper: { ...prev.marketsMapper, ...newMarkets },
        marketsAddresses: Array.from(new Set([...(prev?.marketsAddresses ?? []), ...Object.keys(newMarkets)])),
      }))
    },
    onError: (error) => {
      handleQueryError(error, 'GET_MARKET_BY_ADDRESS_QUERY')
    },
  })

  // andrew_here
  useGraphQLQuery(GET_ALL_MARKETS_QUERY, {
    skip: !activeSubs[LOANS_MARKETS_DATA],
    variables: { limit: 20, offset: 0 },
    onCompleted: (data) => {
      const newMarkets = normalizeLoansMarketsNew({ indexerData: data })

      const marketsAddresses = Object.keys(newMarkets)
      setLoansCtxState((prev) => ({
        ...prev,
        allMarketsAddresses: marketsAddresses,
        marketsAddresses,
        marketsMapper: { ...newMarkets },
      }))
    },
    onError: (error) => {
      handleQueryError(error, 'GET_ALL_MARKETS_QUERY')
      setLoansCtxState((prev) => ({
        ...prev,
        allMarketsAddresses: prev.allMarketsAddresses ?? [],
        marketsAddresses: prev.marketsAddresses ?? [],
        marketsMapper: prev.marketsMapper ?? {},
      }))
    },
  })

  const changeLoansSubscriptionsList = useCallback((newSkips: Partial<LoansSubsRecordType>) => {
    setActiveSubs((prev) => ({ ...prev, ...newSkips }))
  }, [])

  const setLoansChartsData = useCallback((newchartsData: LoansChartsType) => {
    setLoansCtxState((prev) => ({
      ...prev,
      chartsData: newchartsData,
    }))
  }, [])

  const providerValue = useMemo(
    () =>
      getLoansProviderReturnValue({
        loansCtxState,
        marketAddressToSubscribe,
        activeSubs,
        changeLoansSubscriptionsList,
        setMarketAddressToSubscribe,
        setLoansChartsData,
      }),
    [loansCtxState, activeSubs, marketAddressToSubscribe],
  )

  return <loansContext.Provider value={providerValue}>{children}</loansContext.Provider>
}

export const useLoansContext = () => {
  const context = useContext(loansContext)

  if (!context) {
    throw new Error('loansContext should be used within LoansProvider')
  }

  return context
}

export default LoansProvider
