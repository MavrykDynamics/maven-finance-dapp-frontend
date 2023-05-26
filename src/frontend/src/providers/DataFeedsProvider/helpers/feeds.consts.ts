export const FEEDS_AMOUNT_SUB_ID = 'feedsAmountSubsciption'
export const FEEDS_REWARDS_SUB_ID = 'feedsRewardsSubsciption'
export const FEEDS_ADDRESSES_SUB_ID = 'feedsAddressesSubsciption'
export type FeedsStatsSubsArray = Array<
  typeof FEEDS_AMOUNT_SUB_ID | typeof FEEDS_REWARDS_SUB_ID | typeof FEEDS_ADDRESSES_SUB_ID
>
