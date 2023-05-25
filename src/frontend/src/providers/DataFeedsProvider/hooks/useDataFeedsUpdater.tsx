import { useSubscription } from '@apollo/client'

// providers
import { useDataFeedsContext } from '../dataFeeds.provider'

// subs
import { getOrcaleStorageAggregatorQuery } from 'gql/queries/getOracleStorage'
import { useEffect, useState } from 'react'
import { useDAPPConfigContext } from 'providers/DAPPConfig/dappConfig.provider'
import { SubscribeOracleStorageAggregatorSubscription } from 'utils/__generated__/graphql'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'

// TODO add checks if data is empty (valid data with zod) and handle errors for it
export const useDataFeedsUpdater = (skip = false, feedAddress?: string) => {
  const { updateDataFeeds } = useDataFeedsContext()
  const { updateTokensPrices } = useTokensContext()
  const { dipDupContracts } = useDAPPConfigContext()

  const isContractsLoading = dipDupContracts === null

  const [shouldSkip, setShouldSkip] = useState(false)
  const [feeds, setFeeds] = useState<SubscribeOracleStorageAggregatorSubscription['aggregator']>([])

  const { loading: aggregatorLoading } = useSubscription(getOrcaleStorageAggregatorQuery(feedAddress), {
    skip: shouldSkip,
    variables: {
      address: feedAddress,
    },
    onData: ({ data: response }) => {
      const { data } = response
      if (data) {
        setFeeds(data.aggregator)
      }
    },
    shouldResubscribe: true,
    onError: (error) => {
      console.log({ error })
    },
  })

  // Effect to load data 1 time and then skip loading, cuz loading returned from useSubscription si only for initial loading
  useEffect(() => {
    if (!aggregatorLoading && skip) {
      setShouldSkip(true)
    }
  }, [skip, aggregatorLoading])

  console.log({
    aggregatorLoading,
    isContractsLoading,
    feeds,
    dipDupContracts,
  })

  useEffect(() => {
    if (!aggregatorLoading && !isContractsLoading) {
      updateDataFeeds(feeds)
      updateTokensPrices(feeds)
    }
  }, [aggregatorLoading, feeds, isContractsLoading, updateDataFeeds])

  return { isLoading: !aggregatorLoading }
}
