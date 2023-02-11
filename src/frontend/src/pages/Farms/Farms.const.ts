export const LIVE_TAB_ID = 1
export const FINISHED_TAB_ID = 2
export type isLiveFarmType = typeof LIVE_TAB_ID | typeof FINISHED_TAB_ID

export const VERTICAL_FARM_VIEW = 'vertical'
export const HORIZONTAL_FARM_VIEW = 'horizontal'
export type FarmsViewVariantType = typeof VERTICAL_FARM_VIEW | typeof HORIZONTAL_FARM_VIEW

export const STAKED = 1
export const NO_STAKED = 0
export type isStakedFarmType = typeof STAKED | typeof NO_STAKED

export const itemsForFarmsSortDD = [
  { text: 'Active', value: 'active' },
  { text: 'Highest APY', value: 'highestAPY' },
  { text: 'Lowest APY', value: 'lowestAPY' },
  { text: 'Highest liquidity (lpBalance)', value: 'highestLiquidity' },
  { text: 'Lowest liquidity (lpBalance)', value: 'lowestLiquidity' },
  { text: 'Your Largest Stake', value: 'yourLargestStake' },
  { text: 'Rewards Per Block', value: 'rewardsPerBlock' },
]

export type FarmsFiltersStateType = {
  isStaked: isStakedFarmType
  openedFarmsCards: Array<string>
  isLive: isLiveFarmType
  searchValue: string
  sortBy: string
  farmsViewVariant: FarmsViewVariantType
}
