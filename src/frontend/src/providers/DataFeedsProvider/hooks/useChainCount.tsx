import { useSubscription } from '@apollo/client'
import { SUBSCRIBE_CHAIN_POINTS_COUNT, SUBSCRIBE_FEEDS_REWARDS_COUNT } from 'gql/queries'

export const useFeedsAmount = () => {
  const { data: feedsAmountGql } = useSubscription(SUBSCRIBE_CHAIN_POINTS_COUNT, {
    fetchPolicy: 'network-only',
  })

  const { data: rewardsAmountGql } = useSubscription(SUBSCRIBE_FEEDS_REWARDS_COUNT, {
    fetchPolicy: 'network-only',
  })

  const feedsAmount = feedsAmountGql ? feedsAmountGql.aggregator_aggregate.aggregate?.count ?? 0 : 0
  const rewardsAmount = rewardsAmountGql ? rewardsAmountGql ?? 0 : 0

  return { feedsAmount, rewardsAmount }
}
