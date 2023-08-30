import { FarmCtxStateType, FarmsProviderSubsType, NullableFarmCtxStateType } from '../farms.provider.types'

// farms subs
export const FARMS_DATA_SUB = 'FARMS_DATA_SUB'

export const DEFAULT_FARMS_ACTIVE_SUBS: FarmsProviderSubsType = {
  [FARMS_DATA_SUB]: null,
}

// farm subs type
export const FARMS_ALL_DATA_SUB = 'FARMS_ALL_DATA_SUB'
export const FARMS_LIVE_NOT_STAKED_DATA_SUB = 'FARMS_LIVE_NOT_STAKED_DATA_SUB'
export const FARMS_LIVE_STAKED_DATA_SUB = 'FARMS__STAKED_LIVE_DATA_SUB'
export const FARMS_FINISHED_NOT_STAKED_DATA_SUB = 'FARMS_FINISHED_NOT_STAKED_DATA_SUB'
export const FARMS_FINISHED_STAKED_DATA_SUB = 'FARMS__FINISHED_LIVE_DATA_SUB'

// farms context
export const DEFAULT_FARMS_CTX: NullableFarmCtxStateType = {
  farmsMapper: null,
  liveNotStakedFarms: null,
  finishedNotStakedFarms: null,
  liveStakedFarms: null,
  finishedStakedFarms: null,
  allFarms: null,
}

export const EMPTY_FARMS_CTX: FarmCtxStateType = {
  farmsMapper: {},
  liveNotStakedFarms: [],
  finishedNotStakedFarms: [],
  liveStakedFarms: [],
  finishedStakedFarms: [],
  allFarms: [],
}
