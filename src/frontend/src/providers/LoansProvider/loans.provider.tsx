import React, { useContext, useMemo, useState } from 'react'

// types

// helpers
import { ApolloError, useSubscription } from '@apollo/client'
import { LoansContext, LoansContextState, LoansSubsRecordType, LoansSubsType } from './loans.provider.types'
import { GET_LOANS_MARKET_ADDRESSES } from './queries/loansMarkets.query'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { TOASTER_SUBSCRIPTION_ERROR } from 'providers/ToasterProvider/toaster.provider.const'
import { TOASTER_TEXTS } from 'app/App.components/Toaster/texts/toaster.texts'
import { DEFAULT_LOANS_ACTIVE_SUBS, LOANS_MARKETS_ADDRESSES } from './helpers/loans.const'

export const loansContext = React.createContext<LoansContext>(undefined!)

type Props = {
  children: React.ReactNode
}

export const LoansProvider = ({ children }: Props) => {
  const { bug } = useToasterContext()

  const handleSubError = (error: ApolloError, subName: LoansSubsType) => {
    console.error(`${subName} query error: `, error)
    bug(TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['message'], TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
  }

  const [activeSubs, setActiveSubs] = useState<LoansSubsRecordType>(DEFAULT_LOANS_ACTIVE_SUBS)
  const [loansCtxState, setLoansCtxState] = useState<LoansContextState>({
    marketAddresses: [],
    marketsMapper: {},
    config: {
      daoFee: 0,
    },
  })

  const { loading: isMarketsAddressesLoading } = useSubscription(GET_LOANS_MARKET_ADDRESSES, {
    skip: !activeSubs.loansMarketsAddresses,
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

  const changeLoansSubscriptionsList = (newSkips: Partial<LoansSubsRecordType>) => {
    setActiveSubs((prev) => ({ ...prev, ...newSkips }))
  }

  const providerValue = useMemo(() => {
    return {
      ...loansCtxState,
      isLoading: isMarketsAddressesLoading,
      changeLoansSubscriptionsList,
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
