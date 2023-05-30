import { useSubscription } from '@apollo/client'

// providers
import { useDataFeedsContext } from '../dataFeeds.provider'

// subs
import { SUBSCRIBE_FEEDS } from 'gql/queries/getFeedsStorage'
import { useEffect, useState } from 'react'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { FeedsSubscriptionSkipsType } from '../helpers/feeds.types'
import { SUB_SUBSCRIBE, SUB_SKIP, SUB_QUERY } from 'utils/api/apollo.consts'

export const useDataFeedsUpdater = (
  { skipFeedsSubscription }: FeedsSubscriptionSkipsType = { skipFeedsSubscription: SUB_SUBSCRIBE },
) => {
  const { updateDataFeeds } = useDataFeedsContext()
  const { updateTokensPrices } = useTokensContext()

  const [shouldSkip, setShouldSkip] = useState<FeedsSubscriptionSkipsType>({ skipFeedsSubscription })

  const { loading: aggregatorLoading } = useSubscription(SUBSCRIBE_FEEDS, {
    skip: shouldSkip.skipFeedsSubscription === SUB_SKIP,
    shouldResubscribe: true,
    onData: ({ data: response }) => {
      const { data } = response
      if (data) {
        updateDataFeeds(data.aggregator)
        updateTokensPrices(data.aggregator)
      }
    },
    onError: (error) => {
      console.log({ error })
    },
  })

  // Effect to load data 1 time and then skip loading, cuz loading returned from useSubscription si only for initial loading
  useEffect(() => {
    if (!aggregatorLoading && skipFeedsSubscription === SUB_QUERY) {
      setShouldSkip((prevSkip) => ({
        ...prevSkip,
        skipFeedsSubscription: SUB_SKIP,
      }))
    }
  }, [skipFeedsSubscription, aggregatorLoading])

  return { isLoading: aggregatorLoading }
}
