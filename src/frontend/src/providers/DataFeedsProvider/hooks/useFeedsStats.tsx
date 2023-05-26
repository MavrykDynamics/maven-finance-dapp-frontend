import { useSubscription } from '@apollo/client'

import { SUBSCRIBE_CHAIN_POINTS_COUNT, SUBSCRIBE_FEEDS_REWARDS_COUNT } from 'gql/queries'

import { FEEDS_AMOUNT_SUB_ID, FEEDS_REWARDS_SUB_ID, FeedsStatsSubsArray } from '../helpers/feeds.consts'

export const useFeedsStats = (subsToUse: FeedsStatsSubsArray = [FEEDS_AMOUNT_SUB_ID, FEEDS_REWARDS_SUB_ID]) => {
  const { data: feedsAmountGql } = useSubscription(SUBSCRIBE_CHAIN_POINTS_COUNT, {
    skip: !subsToUse.includes(FEEDS_AMOUNT_SUB_ID),
    fetchPolicy: 'network-only',
  })

  const { data: rewardsAmountGql } = useSubscription(SUBSCRIBE_FEEDS_REWARDS_COUNT, {
    skip: !subsToUse.includes(FEEDS_AMOUNT_SUB_ID),
    fetchPolicy: 'network-only',
  })

  const feedsAmount = feedsAmountGql ? feedsAmountGql.aggregator_aggregate.aggregate?.count ?? 0 : 0
  const rewardsAmount = rewardsAmountGql
    ? rewardsAmountGql.aggregator_aggregate.aggregate?.sum?.reward_amount_smvk ?? 0
    : 0

  return { feedsAmount, rewardsAmount }
}
