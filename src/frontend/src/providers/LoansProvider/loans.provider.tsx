import { ApolloError, useSubscription } from '@apollo/client'
import React, { useContext, useMemo, useState } from 'react'

// context
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

// types
import { LoansContext, NullableLoansContextState, LoansSubsRecordType } from './loans.provider.types'
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
} from './helpers/loans.const'

// helpers
import { normalizeLoansConfig, normalizeLoansMarkets } from './helpers/loansMarkets.normalizer'
import { getLoansProviderReturnValue } from './helpers/loans.utils'

export const loansContext = React.createContext<LoansContext>(undefined!)

type Props = {
  children: React.ReactNode
}

/**
 * NOTES:
 *
 * Single market sub: need to use SATELLITES_DATA_SINGLE_SUB sub type along with providing satellite addres
 * via setSatelliteAddressToSubsctibe, if this address is from indexer (userAddress, when isSatelliteTrue, or satelliteDelegatedTo)
 * you don't need to check whether satellite exists, if address can be modified by user, or we not sure whether satellite exists, we need to check it first
 * with apolloClient and CHECK_WHETHER_SATELLITE_EXISTS query, othervise if satellite is not exists it will show infinity loader
 */
export const LoansProvider = ({ children }: Props) => {
  const { bug } = useToasterContext()

  const [activeSubs, setActiveSubs] = useState<LoansSubsRecordType>(DEFAULT_LOANS_ACTIVE_SUBS)
  const [marketAddressToSubscribe, setMarketAddressToSubscribe] = useState<null | TokenAddressType>(null)
  const [loansCtxState, setLoansCtxState] = useState<NullableLoansContextState>(DEFAULT_LOANS_CONTEXT)

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
  }

  const changeLoansSubscriptionsList = (newSkips: Partial<LoansSubsRecordType>) => {
    setActiveSubs((prev) => ({ ...prev, ...newSkips }))
  }

  const providerValue = useMemo(
    () =>
      getLoansProviderReturnValue({
        loansCtxState,
        marketAddressToSubscribe,
        activeSubs,
        changeLoansSubscriptionsList,
        setMarketAddressToSubscribe,
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
