import { SubscriptionSkipType } from 'utils/api/apollo.consts'

export type FeedsStatsSubsSkipsType = {
  skipFeedsAmountSubsciption?: SubscriptionSkipType
  skipFeedsRewardsSubsciption?: SubscriptionSkipType
  skipFeedsAddressesSubsciption?: SubscriptionSkipType
}

export type FeedsSubscriptionSkipsType = {
  skipFeedsSubscription?: SubscriptionSkipType
}
