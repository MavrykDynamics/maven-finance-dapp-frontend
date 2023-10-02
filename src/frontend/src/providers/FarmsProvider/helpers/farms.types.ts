import { STAKED, NO_STAKED, LIVE_TAB_ID, FINISHED_TAB_ID } from './farms.const'

export type isStakedFarmType = typeof STAKED | typeof NO_STAKED
export type isLiveFarmType = typeof LIVE_TAB_ID | typeof FINISHED_TAB_ID

export type FarmsFiltersStateType = {
  isStaked: isStakedFarmType
  openedFarmsCards: Array<string>
  isLive: isLiveFarmType
  searchValue: string
  sortBy: string
}

export type FarmsFilterEventType = { filterType: 'search' | 'sort' | 'isStaked' | 'isLive' | 'openCard' } & Partial<{
  newStakedValue: isStakedFarmType
  newLiveFinished: isLiveFarmType
  newSearchText: string
  newSortBy: string
  newOpenCardAddress: string
}>
