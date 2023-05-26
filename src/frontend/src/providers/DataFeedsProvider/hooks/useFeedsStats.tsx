import { useEffect, useState } from 'react'
import { useSubscription } from '@apollo/client'

import { SUBSCRIBE_CHAIN_POINTS_COUNT, SUBSCRIBE_FEEDS_ADDRESSES, SUBSCRIBE_FEEDS_REWARDS_COUNT } from 'gql/queries'
import { FeedsStatsSubsSkipsType } from '../helpers/feeds.types'
import { SUB_QUERY, SUB_SKIP, SUB_SUBSCRIBE } from 'utils/api/apollo.consts'
import { useDataFeedsContext } from '../dataFeeds.provider'

export const useFeedsStats = (
  {
    skipFeedsAmountSubsciption,
    skipFeedsRewardsSubsciption,
    skipFeedsAddressesSubsciption,
  }: FeedsStatsSubsSkipsType = {
    skipFeedsAmountSubsciption: SUB_SUBSCRIBE,
    skipFeedsRewardsSubsciption: SUB_SUBSCRIBE,
    skipFeedsAddressesSubsciption: SUB_SUBSCRIBE,
  },
) => {
  const { feedsAddresses: feedsAddressesCtx } = useDataFeedsContext()

  const [shouldSkip, setShouldSkip] = useState<FeedsStatsSubsSkipsType>({
    skipFeedsAmountSubsciption,
    skipFeedsRewardsSubsciption,
    skipFeedsAddressesSubsciption,
  })

  const { loading: feedsAmountLoading, data: feedsAmountGql } = useSubscription(SUBSCRIBE_CHAIN_POINTS_COUNT, {
    skip: shouldSkip.skipFeedsAmountSubsciption === SUB_SKIP,
  })

  const { loading: feedsRewardsLoading, data: rewardsAmountGql } = useSubscription(SUBSCRIBE_FEEDS_REWARDS_COUNT, {
    skip: shouldSkip.skipFeedsRewardsSubsciption === SUB_SKIP,
  })

  const { loading: feedsAddressesLoading, data: feedsAddressesGql } = useSubscription(SUBSCRIBE_FEEDS_ADDRESSES, {
    skip: shouldSkip.skipFeedsAddressesSubsciption === SUB_SKIP,
  })

  // Effect to load data 1 time and then skip loading, cuz loading returned from useSubscription si only for initial loading
  useEffect(() => {
    if (!feedsAmountLoading && skipFeedsAmountSubsciption === SUB_QUERY) {
      setShouldSkip((prevSkip) => ({
        ...prevSkip,
        skipFeedsAmountSubsciption: SUB_SKIP,
      }))
    }

    if (!feedsRewardsLoading && skipFeedsRewardsSubsciption === SUB_QUERY) {
      setShouldSkip((prevSkip) => ({
        ...prevSkip,
        skipFeedsRewardsSubsciption: SUB_SKIP,
      }))
    }

    if (!feedsAddressesLoading && skipFeedsAddressesSubsciption === SUB_QUERY) {
      setShouldSkip((prevSkip) => ({
        ...prevSkip,
        skipFeedsAddressesSubsciption: SUB_SKIP,
      }))
    }
  }, [
    skipFeedsAmountSubsciption,
    skipFeedsRewardsSubsciption,
    skipFeedsAddressesSubsciption,
    feedsAmountLoading,
    feedsRewardsLoading,
    feedsAddressesLoading,
  ])

  const feedsAmount = feedsAmountGql ? feedsAmountGql.aggregator_aggregate.aggregate?.count ?? 0 : 0
  const rewardsAmount = rewardsAmountGql
    ? rewardsAmountGql.aggregator_aggregate.aggregate?.sum?.reward_amount_smvk ?? 0
    : 0
  const feedsAddresses = feedsAddressesLoading
    ? feedsAddressesCtx
    : feedsAddressesGql?.aggregator?.map((feed) => feed.address) ?? []

  return {
    isLoading: feedsRewardsLoading || feedsAddressesLoading || feedsAmountLoading,
    feedsAmount,
    rewardsAmount,
    feedsAddresses,
  }
}
