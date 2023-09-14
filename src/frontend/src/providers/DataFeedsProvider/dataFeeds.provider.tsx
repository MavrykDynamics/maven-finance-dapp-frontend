import React, { useContext, useMemo, useState } from 'react'
import { useQuery } from '@apollo/client'

// consts
import { FEEDS_QUERY, FEEDS_UPDATE_QUERY } from './queries/feeds.query'
import {
  DEFAULT_DATA_FEEDS_CTX,
  DEFAULT_DATA_FEEDS_HISTORY,
  DFEFAULT_DATA_FEEDS_VOLATILITY,
} from './helpers/feeds.consts'

// types
import { ChartPeriodType } from 'types/charts.type'
import { DataFeedsContext, NullableDataFeedsContextStateType } from './dataFeeds.provider.types'
import {
  fullFeedsQuerySchema,
  FullFeedsQueryType,
  smallFeedsQuerySchema,
  SmallFeedsQueryType,
} from './helpers/feeds.schemas'

// helpers
import { getDataFeedsProviderReturnValue } from './helpers/feeds.utils'
import { normalizeDataFeedsHistory, normalizeFeeds, normalizeFeedsPrices } from './helpers/feedsNormalizer'

// hooks
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useApolloContext } from 'providers/ApolloProvider/apollo.provider'
import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch'

// types
import { FeedHistoryQeuryQuery } from 'utils/__generated__/graphql'

export const dataFeedsContext = React.createContext<DataFeedsContext>(undefined!)

const propomotedAddresses = [
  'KT1AgXce6SwfMNQ6wcKGALHi46FuN77bHioV',
  'KT1C1sYNxacr8LPZimA512gAfWajdGah75nq',
  'KT1BYGLiHStMzdv2WCikKKDtFtvUjxzZ8WB9',
]

type Props = {
  children: React.ReactNode
}

export const DataFeedsProvider = ({ children }: Props) => {
  const { updateTokensPrices } = useTokensContext()
  const { handleApolloError } = useApolloContext()

  const [feedsCtxState, setFeedsCtxState] = useState<NullableDataFeedsContextStateType>(DEFAULT_DATA_FEEDS_CTX)

  // load initial feeds data
  const { refetch: refetchDataFeeds } = useQuery(FEEDS_QUERY, {
    onCompleted: (data) => {
      try {
        const parsedFeeds = fullFeedsQuerySchema.parse(data.aggregator)

        updateFullDataFeeds(parsedFeeds)
        updateTokensPrices(parsedFeeds)
      } catch (e) {
        console.log('zod full feeds query parsing error:', { e })
      }
    },
    onError: (error) => handleApolloError(error, 'FEEDS_QUERY'),
  })

  // update feeds price and track whether need to load new feed
  useQueryWithRefetch(FEEDS_UPDATE_QUERY, {
    onCompleted: (data) => {
      try {
        const parsedSmallFeeds = smallFeedsQuerySchema.parse(data.aggregator)

        // if we received not same amount of feeds than we have in ctx refetch full feeds query (rare case)
        if (feedsCtxState.feedsAddresses && parsedSmallFeeds.length !== feedsCtxState.feedsAddresses.length) {
          refetchDataFeeds()
          return
        }

        updateSmallDataFeeds(parsedSmallFeeds)
        updateTokensPrices(parsedSmallFeeds)
      } catch (e) {
        console.log('zod small feeds query parsing error:', { e })
      }
    },
    onError: (error) => handleApolloError(error, 'FEEDS_UPDATE_QUERY'),
  })

  // normalize and update for full feeds query
  const updateFullDataFeeds = (data: FullFeedsQueryType) => {
    const { feedsCategories, feedsAddresses, feedsMapper } = normalizeFeeds(data, propomotedAddresses)

    setFeedsCtxState((prevState) => ({
      ...prevState,
      feedsCategories: Array.from(new Set([...(prevState.feedsCategories ?? []), ...feedsCategories])),
      feedsAddresses: Array.from(new Set([...(feedsCtxState.feedsAddresses ?? []), ...feedsAddresses])),
      feedsMapper: { ...feedsCtxState.feedsMapper, ...feedsMapper },
    }))
  }

  // normalize and update for small feeds query
  const updateSmallDataFeeds = (data: SmallFeedsQueryType) => {
    setFeedsCtxState((prevState) => ({
      ...prevState,
      feedsMapper: normalizeFeedsPrices(prevState.feedsMapper ?? {}, data),
    }))
  }

  // normalize feeds history and volatility
  const updateFeedsHistoryAndVolatility = (
    data: FeedHistoryQeuryQuery['aggregator'][number]['history_data'],
    period: ChartPeriodType,
  ) => {
    const { dataFeedsHistory, dataFeedsVolatility } = normalizeDataFeedsHistory(data)

    setFeedsCtxState((prevState) => ({
      ...prevState,
      dataFeedsHistory: { ...prevState.dataFeedsHistory, [period]: dataFeedsHistory },
      dataFeedsVolatility: { ...prevState.dataFeedsVolatility, [period]: dataFeedsVolatility },
    }))
  }

  const resetFeedsHistoryAndVolatility = () => {
    setFeedsCtxState((prevState) => ({
      ...prevState,
      dataFeedsHistory: DEFAULT_DATA_FEEDS_HISTORY,
      dataFeedsVolatility: DFEFAULT_DATA_FEEDS_VOLATILITY,
    }))
  }

  const contextProviderValue = useMemo(
    () =>
      getDataFeedsProviderReturnValue({
        feedsCtxState,
        updateFeedsHistoryAndVolatility,
        resetFeedsHistoryAndVolatility,
      }),
    [feedsCtxState],
  )

  return <dataFeedsContext.Provider value={contextProviderValue}>{children}</dataFeedsContext.Provider>
}

export const useDataFeedsContext = () => {
  const context = useContext(dataFeedsContext)

  if (!context) {
    throw new Error('dataFeedsContext should be used within DataFeedsProvider')
  }

  return context
}

export default DataFeedsProvider
