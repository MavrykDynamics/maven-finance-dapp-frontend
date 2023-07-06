import React, { useContext, useMemo, useState } from 'react'

// types
import { DataFeedsContext, DataFeedsContextState } from './dataFeeds.provider.types'
import { SubsribeOracleDataFeedSubscription } from 'utils/__generated__/graphql'

// helpers
import { normalizeFeeds } from './helpers/feedsNormalizer'
import { useSubscription } from '@apollo/client'
import { SUBSCRIBE_FEEDS } from './queries/feeds.query'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'

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

  const [feedsCtxState, setFeedsCtxState] = useState<DataFeedsContextState>({
    feedsAddresses: [],
    feedsMapper: {},
    feedsCategories: [],
  })

  const { loading: aggregatorLoading } = useSubscription(SUBSCRIBE_FEEDS, {
    shouldResubscribe: true,
    onData: ({ data: { data } }) => {
      if (!data) return

      updateDataFeeds(data.aggregator)
      updateTokensPrices(data.aggregator)
    },
    onError: (error) => console.log({ error }),
  })

  const updateDataFeeds = (data: SubsribeOracleDataFeedSubscription['aggregator']) => {
    const { feedsCategories, feedsAddresses, feedsMapper } = normalizeFeeds(data, propomotedAddresses)

    setFeedsCtxState({
      ...feedsCtxState,
      feedsCategories: Array.from(new Set([...feedsCtxState.feedsCategories, ...feedsCategories])),
      feedsAddresses: Array.from(new Set([...feedsCtxState.feedsAddresses, ...feedsAddresses])),
      feedsMapper: { ...feedsCtxState.feedsMapper, ...feedsMapper },
    })
  }

  const providerValue = useMemo(() => {
    return { ...feedsCtxState, isLoading: aggregatorLoading }
  }, [aggregatorLoading, feedsCtxState])

  return <dataFeedsContext.Provider value={providerValue}>{children}</dataFeedsContext.Provider>
}

export const useDataFeedsContext = () => {
  const context = useContext(dataFeedsContext)

  if (!context) {
    throw new Error('dataFeedsContext should be used within Data Feeds provider')
  }

  return context
}

export default DataFeedsProvider
