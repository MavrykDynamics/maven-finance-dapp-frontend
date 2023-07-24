import { useEffect, useState } from 'react'
import { useSubscription } from '@apollo/client'

import { FeedsStatsSubsSkipsType } from '../helpers/feeds.types'
import { SUB_QUERY, SUB_SKIP, SUB_SUBSCRIBE } from 'utils/api/apollo.consts'
import { SUBSCRIBE_FEEDS_REWARDS_COUNT } from '../queries/feeds.query'

export const useFeedsStats = (
  { skipFeedsRewardsSubsciption }: FeedsStatsSubsSkipsType = {
    skipFeedsRewardsSubsciption: SUB_SUBSCRIBE,
  },
) => {
  const [shouldSkip, setShouldSkip] = useState<FeedsStatsSubsSkipsType>({
    skipFeedsRewardsSubsciption,
  })

  const { loading: feedsRewardsLoading, data: rewardsAmountGql } = useSubscription(SUBSCRIBE_FEEDS_REWARDS_COUNT, {
    skip: shouldSkip.skipFeedsRewardsSubsciption === SUB_SKIP,
  })

  // Effect to load data 1 time and then skip loading, cuz loading returned from useSubscription si only for initial loading
  useEffect(() => {
    if (!feedsRewardsLoading && skipFeedsRewardsSubsciption === SUB_QUERY) {
      setShouldSkip((prevSkip) => ({
        ...prevSkip,
        skipFeedsRewardsSubsciption: SUB_SKIP,
      }))
    }
  }, [skipFeedsRewardsSubsciption, feedsRewardsLoading])

  const rewardsAmount = rewardsAmountGql
    ? rewardsAmountGql.aggregator_aggregate.aggregate?.sum?.reward_amount_smvk ?? 0
    : 0

  return {
    isLoading: feedsRewardsLoading,
    rewardsAmount,
  }
}
