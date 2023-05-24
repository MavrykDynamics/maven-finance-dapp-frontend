import { useSubscription } from '@apollo/client'

// providers
import { useDataFeedsContext } from '../dataFeeds.provider'

// subs
import { getOrcaleStorageAggregatorQuery } from 'gql/queries/getOracleStorage'
import { useEffect, useState } from 'react'

// TODO add checks if data is empty (valid data with zod) and handle errors for it
export const useDataFeedsUpdater = (skip = false, feedAddress?: string) => {
  const { updateDataFeeds } = useDataFeedsContext()

  const [shouldSkip, setShouldSkip] = useState(false)

  const { loading: aggregatorLoading } = useSubscription(getOrcaleStorageAggregatorQuery(feedAddress), {
    skip: shouldSkip,
    variables: {
      address: feedAddress,
    },
    onData: ({ data: response }) => {
      const { data } = response
      console.log(data)
      if (data) {
        updateDataFeeds(data.aggregator)
      }
    },
    shouldResubscribe: true,
    onError: (error) => {
      console.log({ error })
    },
  })

  console.log({ aggregatorLoading, shouldSkip })

  // Effect to load data 1 time and then skip loading, cuz loading returned from useSubscription si only for initial loading
  useEffect(() => {
    if (!aggregatorLoading && skip) {
      setShouldSkip(true)
    }
  }, [skip, aggregatorLoading])

  return { isLoading: !aggregatorLoading }
}
