import { FarmCtxStateType, FarmsProviderSubsType, NullableFarmCtxStateType } from '../farms.provider.types'

// farms subs
export const FARMS_DATA_SUB = 'FARMS_DATA_SUB'

export const DEFAULT_FARMS_ACTIVE_SUBS: FarmsProviderSubsType = {
  [FARMS_DATA_SUB]: null,
}

// farm subs type
export const FARMS_ALL_DATA_SUB = 'FARMS_ALL_DATA_SUB'
export const FARMS_ALL_LIVE_DATA_SUB = 'FARMS_ALL_LIVE_DATA_SUB'
export const FARMS_LIVE_NOT_STAKED_DATA_SUB = 'FARMS_LIVE_NOT_STAKED_DATA_SUB'
export const FARMS_LIVE_STAKED_DATA_SUB = 'FARMS__STAKED_LIVE_DATA_SUB'
export const FARMS_FINISHED_NOT_STAKED_DATA_SUB = 'FARMS_FINISHED_NOT_STAKED_DATA_SUB'
export const FARMS_FINISHED_STAKED_DATA_SUB = 'FARMS__FINISHED_LIVE_DATA_SUB'

// farms action
export const HARVEST_FARM_REWARDS_ACTION = 'HARVEST_FARM_REWARDS_ACTION'
export const DEPOSIT_TO_FARM_ACTION = 'DEPOSIT_TO_FARM_ACTION'
export const WITHDRAW_FROM_FARM_ACTION = 'WITHDRAW_FROM_FARM_ACTION'

// farms context
export const DEFAULT_FARMS_CTX: NullableFarmCtxStateType = {
  farmsMapper: null,
  liveNotStakedFarms: null,
  finishedNotStakedFarms: null,
  liveStakedFarms: null,
  allLiveFarms: null,
  finishedStakedFarms: null,
  allFarms: null,
}

export const EMPTY_FARMS_CTX: FarmCtxStateType = {
  farmsMapper: {},
  liveNotStakedFarms: [],
  finishedNotStakedFarms: [],
  liveStakedFarms: [],
  allLiveFarms: [],
  finishedStakedFarms: [],
  allFarms: [],
}
