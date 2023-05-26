import { useSubscription } from '@apollo/client'

// providers
import { useDataFeedsContext } from '../dataFeeds.provider'

// subs
import { getOrcaleStorageAggregatorQuery } from 'gql/queries/getFeedsStorage'
import { useEffect, useState } from 'react'
import { useDAPPConfigContext } from 'providers/DAPPConfig/dappConfig.provider'
import { SubsribeOracleDataFeedSubscription } from 'utils/__generated__/graphql'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { FeedsSubscriptionSkipsType } from '../helpers/feeds.types'
import { SUB_SUBSCRIBE, SUB_SKIP, SUB_QUERY } from 'utils/api/apollo.consts'

export const useDataFeedsUpdater = (
  { skipFeedsSubscription }: FeedsSubscriptionSkipsType = { skipFeedsSubscription: SUB_SUBSCRIBE },
  feedAddress?: string,
) => {
  const { updateDataFeeds } = useDataFeedsContext()
  const { updateTokensPrices } = useTokensContext()
  const { dipDupContracts } = useDAPPConfigContext()

  const isContractsLoading = dipDupContracts === null

  const [shouldSkip, setShouldSkip] = useState<FeedsSubscriptionSkipsType>({ skipFeedsSubscription })
  const [feeds, setFeeds] = useState<SubsribeOracleDataFeedSubscription['aggregator']>([])

  const { loading: aggregatorLoading } = useSubscription(getOrcaleStorageAggregatorQuery(feedAddress), {
    skip: shouldSkip.skipFeedsSubscription === SUB_SKIP,
    shouldResubscribe: true,
    onData: ({ data: response }) => {
      const { data } = response
      if (data) {
        setFeeds(data.aggregator)
      }
    },
    onError: (error) => {
      console.log({ error })
    },
  })

  // Effect to load data 1 time and then skip loading, cuz loading returned from useSubscription so only for initial loading
  useEffect(() => {
    if (!aggregatorLoading && skipFeedsSubscription === SUB_QUERY) {
      setShouldSkip((prevSkip) => ({
        ...prevSkip,
        skipFeedsSubscription: SUB_SKIP,
      }))
    }
  }, [skipFeedsSubscription, aggregatorLoading])

  // TODO: remove when dipDupContracts are updated
  useEffect(() => {
    if (!aggregatorLoading && !isContractsLoading) {
      updateDataFeeds(feeds)
      updateTokensPrices(feeds)
    }
  }, [aggregatorLoading, feeds, isContractsLoading])

  return { isLoading: aggregatorLoading }
}
