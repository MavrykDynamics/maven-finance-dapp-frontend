import { ApolloError, useSubscription } from '@apollo/client'
import React, { useContext, useEffect, useMemo, useState } from 'react'

// context
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

// types
import { LoansContext, LoansContextState, LoansSubsRecordType, LoansSubsType } from './loans.provider.types'
import { GetLoansMarketsSubscriptionSubscription } from 'utils/__generated__/graphql'
import { TokenAddressType } from 'providers/TokensProvider/tokens.provider.types'

// consts
import { GET_LOANS_CONFIG, GET_LOANS_MARKET_ADDRESSES, getLoansMarketsSubscription } from './queries/loansMarkets.query'
import { TOASTER_SUBSCRIPTION_ERROR } from 'providers/ToasterProvider/toaster.provider.const'
import { TOASTER_TEXTS } from 'app/App.components/Toaster/texts/toaster.texts'
import {
  DEFAULT_LOANS_ACTIVE_SUBS,
  DEFAULT_LOANS_CONTEXT,
  LOANS_CONFIG,
  LOANS_MARKETS_DATA,
  EMPTY_LOANS_CONTEXT,
} from './helpers/loans.const'

// helpers
import { normalizeLoansConfig, normalizeLoansMarkets } from './helpers/loansMarkets.normalizer'
import { replaceNullValuesWithDefault } from 'providers/common/utils/repalceNullValuesWithDefault'

export const loansContext = React.createContext<LoansContext>(undefined!)

type Props = {
  children: React.ReactNode
}

export const LoansProvider = ({ children }: Props) => {
  const { bug } = useToasterContext()

  const [isMarketLoading, setIsMarketLoading] = useState(false)

  const [activeSubs, setActiveSubs] = useState<LoansSubsRecordType>(DEFAULT_LOANS_ACTIVE_SUBS)
  const [marketAddressToSubscribe, setMarketAddressToSubscribe] = useState<null | TokenAddressType>(null)
  const [loansCtxState, setLoansCtxState] = useState<LoansContextState>(DEFAULT_LOANS_CONTEXT)

  /**
   * need to handle market loading status manually cun on queyry variable change it resets the loading status, in some cases it shows loading instead of already loaded data
   * we need to show loader for market metadata in 2 cases:
   *
   *    1. we are loading single market, whose data is not in context yet
   *    2. markets context provider have data for less amount of satellites, that are exists
   *
   * NOTE: loader will be shown only when we set or unset specific satellite address
   **/
  useEffect(() => {
    const { marketsAddresses, marketsMapper, allMarketsAddresses } = loansCtxState
    if (!marketsAddresses || !allMarketsAddresses || !marketsMapper) return

    const isLoadingNotLoadedSingleMarket = marketAddressToSubscribe && !marketsMapper[marketAddressToSubscribe]
    const isLoadingAllSatellitesMetadata =
      !marketAddressToSubscribe && marketsAddresses.length !== allMarketsAddresses.length

    if (activeSubs[LOANS_MARKETS_DATA] && (isLoadingNotLoadedSingleMarket || isLoadingAllSatellitesMetadata)) {
      setIsMarketLoading(true)
    }
  }, [marketAddressToSubscribe])

  const handleSubError = (error: ApolloError, subName: string) => {
    console.error(`${subName} query error: `, error)
    bug(TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['message'], TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
  }

  // subscribe to markets or market data
  useSubscription(getLoansMarketsSubscription({ marketTokenAddress: marketAddressToSubscribe }), {
    skip: !activeSubs[LOANS_MARKETS_DATA],
    variables: {
      marketTokenAddress: marketAddressToSubscribe ?? '',
    },
    shouldResubscribe: true,
    onData: ({ data: { data } }) => {
      if (!data) return

      updateMarketsContext(data)
    },
    onError: (error) => handleSubError(error, 'getLoansMarketsSubscription'),
  })

  // subscribe to all markets addresses, used for pagination
  useSubscription(GET_LOANS_MARKET_ADDRESSES, {
    shouldResubscribe: true,
    onData: ({ data: { data } }) => {
      if (!data) return

      setLoansCtxState((prev) => ({
        ...prev,
        allMarketsAddresses: Array.from(
          new Set(data.lending_controller[0].loan_tokens.map(({ token: { token_address } }) => token_address)),
        ),
      }))
    },
    onError: (error) => handleSubError(error, 'GET_LOANS_MARKET_ADDRESSES'),
  })

  // subscribe to markets config
  useSubscription(GET_LOANS_CONFIG, {
    skip: !activeSubs[LOANS_CONFIG],
    shouldResubscribe: true,
    onData: ({ data: { data } }) => {
      if (!data) return

      setLoansCtxState((prev) => ({
        ...prev,
        config: normalizeLoansConfig({ indexerData: data }),
      }))
    },
    onError: (error) => handleSubError(error, 'GET_LOANS_CONFIG'),
  })

  // set markets to context and turn off loaders
  const updateMarketsContext = (indexerData: GetLoansMarketsSubscriptionSubscription) => {
    const newMarkets = normalizeLoansMarkets({ indexerData })

    setLoansCtxState((prev) => ({
      ...prev,
      marketsMapper: { ...prev.marketsMapper, ...newMarkets },
      marketsAddresses: Array.from(new Set([...(prev?.marketsAddresses ?? []), ...Object.keys(newMarkets)])),
    }))

    if (isMarketLoading) setIsMarketLoading(false)
  }

  const changeLoansSubscriptionsList = (newSkips: Partial<LoansSubsRecordType>) => {
    setActiveSubs((prev) => ({ ...prev, ...newSkips }))
  }

  const providerValue = useMemo(() => {
    const { marketsMapper, config, allMarketsAddresses } = loansCtxState
    const commonToReturn = {
      changeLoansSubscriptionsList,
      setMarketAddressToSubscribe,
    }

    /**
     * isLoading indicates whethet provider is loading smth, so we need to show loader, not load in background, cases:
     * 1. if we switch between markets, subscribed to 1 cetrain market and it's not loaded yet
     * 2. if we subscribe to markets and markets context data is empty
     * 3. if we subscribe to config and config context data is empty
     * 4. if we haven't subscribed to anything and don't have any data loaded, need this to fix time which component init its subscribes in useEffect as it's async operation
     */
    const isLoading =
      isMarketLoading ||
      (activeSubs['loansMarkets'] && (marketsMapper === null || allMarketsAddresses === null)) ||
      (activeSubs['loansConfig'] && config === null) ||
      (!activeSubs['loansConfig'] &&
        config === null &&
        !activeSubs['loansMarkets'] &&
        (marketsMapper === null || allMarketsAddresses === null))

    // if provider is loading smth return loading true and default empty context (nonNullable)
    if (isLoading) {
      return {
        ...commonToReturn,
        ...EMPTY_LOANS_CONTEXT,
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
  }, [loansCtxState, activeSubs, isMarketLoading])

  // TODO: debug log, remove when no need
  console.log('loans', { providerValue, activeSubs, loansCtxState })
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
