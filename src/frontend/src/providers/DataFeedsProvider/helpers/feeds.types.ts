import { SubscriptionSkipType } from 'utils/api/apollo.consts'

export type FeedsStatsSubsSkipsType = {
  skipFeedsRewardsSubsciption?: SubscriptionSkipType
}

export type FeedChartsSubsSkipsType = {
  skipFeedChartsSubsciption?: SubscriptionSkipType
}

export type FeedsSubscriptionSkipsType = {
  skipFeedsSubscription?: SubscriptionSkipType
}
