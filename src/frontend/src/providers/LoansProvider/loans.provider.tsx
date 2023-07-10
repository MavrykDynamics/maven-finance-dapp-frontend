import { ApolloError, useSubscription } from '@apollo/client'
import React, { useContext, useMemo, useState } from 'react'

// context
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

// types
import { LoansContext, LoansContextState, LoansSubsRecordType, LoansSubsType } from './loans.provider.types'
import { TokenAddressType } from 'providers/TokensProvider/tokens.provider.types'

// consts
import { GET_LOANS_CONFIG, GET_LOANS_MARKET_ADDRESSES, getLoansMarketsSubscription } from './queries/loansMarkets.query'
import { TOASTER_SUBSCRIPTION_ERROR } from 'providers/ToasterProvider/toaster.provider.const'
import { TOASTER_TEXTS } from 'app/App.components/Toaster/texts/toaster.texts'
import { DEFAULT_LOANS_ACTIVE_SUBS, LOANS_CONFIG, LOANS_MARKETS_ADDRESSES } from './helpers/loans.const'

// helpers
import { normalizeLoansConfig, normalizeLoansMarkets } from './helpers/loansMarkets.normalizer'

export const loansContext = React.createContext<LoansContext>(undefined!)

type Props = {
  children: React.ReactNode
}

/**
 * TODO: add mvk operators later, or even add it to vault
 */
export const LoansProvider = ({ children }: Props) => {
  const { bug } = useToasterContext()

  const handleSubError = (error: ApolloError, subName: LoansSubsType) => {
    console.error(`${subName} query error: `, error)
    bug(TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['message'], TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
  }

  const [activeSubs, setActiveSubs] = useState<LoansSubsRecordType>(DEFAULT_LOANS_ACTIVE_SUBS)
  const [marketAddressToSubscribe, setMarketAddressToSubscribe] = useState<null | TokenAddressType>(null)
  const [loansCtxState, setLoansCtxState] = useState<LoansContextState>({
    marketAddresses: [],
    marketsMapper: {},
    config: null,
  })

  const { loading: isMarketsLoading } = useSubscription(
    getLoansMarketsSubscription({ marketTokenAddress: marketAddressToSubscribe }),
    {
      skip: !activeSubs[LOANS_MARKETS_ADDRESSES],
      variables: {
        marketAddressToSubscribe: marketAddressToSubscribe ?? '',
      },
      shouldResubscribe: true,
      onData: ({ data: { data } }) => {
        if (!data) return

        const normalizedMarkets = normalizeLoansMarkets({ indexerData: data })
        setLoansCtxState((prev) => ({
          ...prev,
          marketsMapper: normalizedMarkets,
        }))
      },
      onError: (error) => handleSubError(error, LOANS_MARKETS_ADDRESSES),
    },
  )

  const { loading: isMarketsAddressesLoading } = useSubscription(GET_LOANS_MARKET_ADDRESSES, {
    skip: !activeSubs[LOANS_MARKETS_ADDRESSES],
    shouldResubscribe: true,
    onData: ({ data: { data } }) => {
      if (!data) return
      setLoansCtxState((prev) => ({
        ...prev,
        marketAddresses: Array.from(
          new Set(data.lending_controller[0].loan_tokens.map(({ token: { token_address } }) => token_address)),
        ),
      }))
    },
    onError: (error) => handleSubError(error, LOANS_MARKETS_ADDRESSES),
  })

  const { loading: isLoansConfigLoading } = useSubscription(GET_LOANS_CONFIG, {
    skip: !activeSubs[LOANS_CONFIG],
    shouldResubscribe: true,
    onData: ({ data: { data } }) => {
      if (!data) return
      setLoansCtxState((prev) => ({
        ...prev,
        config: normalizeLoansConfig({ indexerData: data }),
      }))
    },
    onError: (error) => handleSubError(error, LOANS_CONFIG),
  })

  const changeLoansSubscriptionsList = (newSkips: Partial<LoansSubsRecordType>) => {
    setActiveSubs((prev) => ({ ...prev, ...newSkips }))
  }

  const providerValue = useMemo(() => {
    return {
      ...loansCtxState,
      isLoading: isMarketsAddressesLoading || isLoansConfigLoading || isMarketsLoading,
      changeLoansSubscriptionsList,
      setMarketAddressToSubscribe,
    }
  }, [loansCtxState])
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
