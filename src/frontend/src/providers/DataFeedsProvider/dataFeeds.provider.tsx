import React, { useContext, useMemo, useRef, useState } from 'react'
import { useQuery } from '@apollo/client'

// types
import { DataFeedsContext, DataFeedsContextState } from './dataFeeds.provider.types'
import {
  fullFeedsQuerySchema,
  FullFeedsQueryType,
  smallFeedsQuerySchema,
  SmallFeedsQueryType,
} from './helpers/feeds.schemes'

// helpers
import { normalizeFeeds, normalizeFeedsPrices } from './helpers/feedsNormalizer'
import { FEEDS_QUERY, FEEDS_UPDATE_QUERY } from './queries/feeds.query'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch'

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

  // TODO: calc it based on nullable values
  const initialLoadingStatus = useRef(true)

  const [feedsCtxState, setFeedsCtxState] = useState<DataFeedsContextState>({
    feedsAddresses: [],
    feedsMapper: {},
    feedsCategories: [],
  })

  // load initial feeds data
  const { refetch: refetchDataFeeds } = useQuery(FEEDS_QUERY, {
    onCompleted: (data) => {
      try {
        initialLoadingStatus.current = false

        const parsedFeeds = fullFeedsQuerySchema.parse(data.aggregator)

        updateFullDataFeeds(parsedFeeds)
        updateTokensPrices(parsedFeeds)
      } catch (e) {
        console.log('zod full feeds query parsing error:', { e })
      }
    },
    onError: (error) => console.log({ error }),
  })

  // update feeds price and track whether need to load new feed
  useQueryWithRefetch(FEEDS_UPDATE_QUERY, {
    skip: initialLoadingStatus.current,
    onCompleted: (data) => {
      try {
        const parsedSmallFeeds = smallFeedsQuerySchema.parse(data.aggregator)

        // if we received not same amount of feeds than we have in ctx refetch full feeds query (rare case)
        if (parsedSmallFeeds.length !== feedsCtxState.feedsAddresses.length) {
          refetchDataFeeds()
          return
        }

        updateSmallDataFeeds(parsedSmallFeeds)
        updateTokensPrices(parsedSmallFeeds)
      } catch (e) {
        console.log('zod small feeds query parsing error:', { e })
      }
    },
    onError: (error) => console.log({ error }),
  })

  // normalize and update for full feeds query
  const updateFullDataFeeds = (data: FullFeedsQueryType) => {
    const { feedsCategories, feedsAddresses, feedsMapper } = normalizeFeeds(data, propomotedAddresses)

    setFeedsCtxState({
      ...feedsCtxState,
      feedsCategories: Array.from(new Set([...feedsCtxState.feedsCategories, ...feedsCategories])),
      feedsAddresses: Array.from(new Set([...feedsCtxState.feedsAddresses, ...feedsAddresses])),
      feedsMapper: { ...feedsCtxState.feedsMapper, ...feedsMapper },
    })
  }

  // normalize and update for small feeds query
  const updateSmallDataFeeds = (data: SmallFeedsQueryType) => {
    const updatedFeeds = normalizeFeedsPrices(feedsCtxState.feedsMapper, data)

    setFeedsCtxState({
      ...feedsCtxState,
      feedsMapper: updatedFeeds,
    })
  }

  const providerValue = useMemo(() => {
    return { ...feedsCtxState, isLoading: initialLoadingStatus.current }
  }, [feedsCtxState])

  return <dataFeedsContext.Provider value={providerValue}>{children}</dataFeedsContext.Provider>
}

export const useDataFeedsContext = () => {
  const context = useContext(dataFeedsContext)

  if (!context) {
    throw new Error('dataFeedsContext should be used within DataFeedsProvider')
  }

  return context
}

export default DataFeedsProvider
