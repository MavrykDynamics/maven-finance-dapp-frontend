import { useSubscription } from '@apollo/client'

import { SUBSCRIBE_CHAIN_POINTS_COUNT, SUBSCRIBE_FEEDS_ADDRESSES, SUBSCRIBE_FEEDS_REWARDS_COUNT } from 'gql/queries'

import {
  FEEDS_ADDRESSES_SUB_ID,
  FEEDS_AMOUNT_SUB_ID,
  FEEDS_REWARDS_SUB_ID,
  FeedsStatsSubsArray,
} from '../helpers/feeds.consts'

export const useFeedsStats = (
  subsToUse: FeedsStatsSubsArray = [FEEDS_AMOUNT_SUB_ID, FEEDS_REWARDS_SUB_ID, FEEDS_ADDRESSES_SUB_ID],
) => {
  const { loading: feedsAmountLoading, data: feedsAmountGql } = useSubscription(SUBSCRIBE_CHAIN_POINTS_COUNT, {
    skip: !subsToUse.includes(FEEDS_AMOUNT_SUB_ID),
    fetchPolicy: 'network-only',
  })

  const { loading: feedsRewardsLoading, data: rewardsAmountGql } = useSubscription(SUBSCRIBE_FEEDS_REWARDS_COUNT, {
    skip: !subsToUse.includes(FEEDS_AMOUNT_SUB_ID),
    fetchPolicy: 'network-only',
  })

  const { loading: feedsAddressesLoading, data: feedsAddressesGql } = useSubscription(SUBSCRIBE_FEEDS_ADDRESSES, {
    skip: !subsToUse.includes(FEEDS_ADDRESSES_SUB_ID),
    fetchPolicy: 'network-only',
  })

  const feedsAmount = feedsAmountGql ? feedsAmountGql.aggregator_aggregate.aggregate?.count ?? 0 : 0
  const rewardsAmount = rewardsAmountGql
    ? rewardsAmountGql.aggregator_aggregate.aggregate?.sum?.reward_amount_smvk ?? 0
    : 0
  const feedsAddresses = feedsAddressesGql?.aggregator?.map((feed) => feed.address) ?? []

  return {
    isLoading: feedsRewardsLoading || feedsAddressesLoading || feedsAmountLoading,
    feedsAmount,
    rewardsAmount,
    feedsAddresses,
  }
}
