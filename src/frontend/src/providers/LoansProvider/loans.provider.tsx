import { ApolloError, useQuery } from '@apollo/client'
import React, { useContext, useMemo, useRef, useState } from 'react'

// context & hooks
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch'

// types
import { LoansContext, NullableLoansContextState, LoansSubsRecordType } from './loans.provider.types'
import { GetLoansMarketsQueryQuery } from 'utils/__generated__/graphql'
import { TokenAddressType } from 'providers/TokensProvider/tokens.provider.types'

// consts
import { GET_LOANS_CONFIG, getLoansMarketsQuery } from './queries/loansMarkets.query'
import { TOASTER_SUBSCRIPTION_ERROR } from 'providers/ToasterProvider/toaster.provider.const'
import { TOASTER_TEXTS } from 'app/App.components/Toaster/texts/toaster.texts'
import {
  DEFAULT_CHARTS_TO_CALC,
  DEFAULT_LOANS_ACTIVE_SUBS,
  DEFAULT_LOANS_CONTEXT,
  LOANS_CONFIG,
  LOANS_MARKETS_DATA,
} from './helpers/loans.const'

// helpers
import { normalizeLoansConfig, normalizeLoansMarkets } from './helpers/loansMarkets.normalizer'
import { getLoansProviderReturnValue, normalizeTransactionHistory } from './helpers/loans.utils'
import { GET_LOANS_HISTORY_DATA, getLoansHistoryQuery } from './queries/loansHistory.query'
import { normalizeLoansCharts } from './helpers/loansCharts.normalizer'
import { LoansChartsType, LoansMarketTransactionHistoryType } from './helpers/loans.types'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'

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
  const { bug } = useToasterContext()
  const { tokensMetadata, tokensPrices } = useTokensContext()
  const { userAddress } = useUserContext()

  // internal states for loan data
  const [activeSubs, setActiveSubs] = useState<LoansSubsRecordType>(DEFAULT_LOANS_ACTIVE_SUBS)
  const [marketAddressToSubscribe, setMarketAddressToSubscribe] = useState<null | TokenAddressType>(null)
  const [vaultAddressToSubscribe, setVaultAddressToSubscribe] = useState<null | string>(null)
  const [chartsToCalc, setChartsToCalc] = useState<LoansChartsType>(DEFAULT_CHARTS_TO_CALC)
  const [loanHistoryDataFilterType, setLoanHistoryDataFilterType] = useState<number[] | null>(null) // array of descr types 1-11, mapper of type -> descr is: getDescrByType

  const prevMarketsDataRef = useRef<Record<TokenAddressType, LoansMarketTransactionHistoryType[]>>({})

  // shared loan state
  const [loansCtxState, setLoansCtxState] = useState<NullableLoansContextState>(DEFAULT_LOANS_CONTEXT)

  const handleSubError = (error: ApolloError, subName: string) => {
    console.error(`${subName} query error: `, error)
    bug(TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['message'], TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
  }

  // subscribe to markets or market data
  useQueryWithRefetch(getLoansMarketsQuery({ marketTokenAddress: marketAddressToSubscribe }), {
    skip: !activeSubs[LOANS_MARKETS_DATA],
    variables: {
      marketTokenAddress: marketAddressToSubscribe ?? '',
    },
    onCompleted: (data) => {
      updateMarketsContext(data)
    },
    onError: (error) => handleSubError(error, 'getLoansMarketsSubscription'),
  })

  // subscribe to markets config
  useQuery(GET_LOANS_CONFIG, {
    skip: !activeSubs[LOANS_CONFIG],
    onCompleted: (data) => {
      setLoansCtxState((prev) => ({
        ...prev,
        config: normalizeLoansConfig({ indexerData: data }),
      }))
    },
    onError: (error) => handleSubError(error, 'GET_LOANS_CONFIG'),
  })

  // subscribe to markets charts data
  const { loading: areChartsLoading } = useQueryWithRefetch(
    GET_LOANS_HISTORY_DATA,
    {
      onCompleted: (data) => {
        if (!data) return

        const newChartsData = normalizeLoansCharts({ indexerData: data, chartsToCalc, tokensPrices, tokensMetadata })
        setLoansCtxState((prev) => ({
          ...prev,
          chartsData: newChartsData,
        }))
      },
      onError: (error) => {
        console.error('GET_LOANS_HISTORY_DATA error: ', { error })
      },
    },
    { blocksDiff: 25 },
  )

  // subscribe to transaction history data

  const { loading: isLoansTransactionHistoryLoading } = useQueryWithRefetch(
    getLoansHistoryQuery({ userAddress, vaultAddress: vaultAddressToSubscribe, typeFilter: loanHistoryDataFilterType }),
    {
      skip: (!userAddress && !vaultAddressToSubscribe) || !marketAddressToSubscribe,
      variables: {
        marketTokenAddress: marketAddressToSubscribe,
        userAddress,
        vaultAddress: vaultAddressToSubscribe,
        typeFilter: loanHistoryDataFilterType,
      },
      onCompleted: (data) => {
        if (!data) return

        const loansTransactionHistoryData = normalizeTransactionHistory(data, tokensMetadata, tokensPrices)

        // set state
        setLoansCtxState((prev) => ({
          ...prev,
          loansTransactionHistoryData,
        }))

        if (marketAddressToSubscribe) prevMarketsDataRef.current[marketAddressToSubscribe] = loansTransactionHistoryData
      },
      onError: (error) => {
        console.error('GET_LOANS_HISTORY_DATA error: ', { error })
      },
    },
  )

  // set markets to context and turn off loaders
  const updateMarketsContext = (indexerData: GetLoansMarketsQueryQuery) => {
    const newMarkets = normalizeLoansMarkets({ indexerData })

    // all addresses needed for pagination
    const allMarketsAddresses = indexerData.allMarketsAddresses[0].loan_tokens.map(
      ({ token: { token_address } }) => token_address,
    )

    setLoansCtxState((prev) => ({
      ...prev,
      allMarketsAddresses,
      marketsMapper: { ...prev.marketsMapper, ...newMarkets },
      marketsAddresses: Array.from(new Set([...(prev?.marketsAddresses ?? []), ...Object.keys(newMarkets)])),
    }))
  }

  // update charts to calc
  // if call without parametrs - it will reset chartsToCalc state
  const modifyChartsToCalc = (newChartsToCalc: Partial<LoansChartsType>) => {
    setChartsToCalc((prev) => ({ ...prev, ...newChartsToCalc }))
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
        chartsToCalc,
        prevMarketHistoryData: marketAddressToSubscribe ? prevMarketsDataRef.current[marketAddressToSubscribe] : null,
        changeLoansSubscriptionsList,
        setMarketAddressToSubscribe,
        setVaultAddressToSubscribe,
        setLoanHistoryDataFilterType,
        modifyChartsToCalc,
        areChartsLoading,
        isLoansTransactionHistoryLoading,
      }),
    [
      loansCtxState,
      marketAddressToSubscribe,
      activeSubs,
      chartsToCalc,
      areChartsLoading,
      isLoansTransactionHistoryLoading,
    ],
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
