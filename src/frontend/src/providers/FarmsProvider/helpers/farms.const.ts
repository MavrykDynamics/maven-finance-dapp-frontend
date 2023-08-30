import { FarmCtxStateType, FarmsProviderSubsType, NullableFarmCtxStateType } from '../farms.provider.types'

// farms subs
export const FARMS_DATA_SUB = 'FARMS_DATA_SUB'

export const DEFAULT_FARMS_ACTIVE_SUBS: FarmsProviderSubsType = {
  [FARMS_DATA_SUB]: null,
}

// farm subs type
export const FARMS_LIVE_DATA_SUB = 'FARMS_LIVE_DATA_SUB'
export const FARMS_FINISHED_DATA_SUB = 'FARMS_FINISHED_DATA_SUB'
export const FARMS_LIVE_STAKED_DATA_SUB = 'FARMS__STAKED_LIVE_DATA_SUB'
export const FARMS_FINISHED_STAKED_DATA_SUB = 'FARMS__FINISHED_LIVE_DATA_SUB'

// farms context
export const DEFAULT_FARMS_CTX: NullableFarmCtxStateType = {
  farmsMapper: null,
  liveFarms: null,
  finishedFarms: null,
  liveStakedFarms: null,
  finishedStakedFarms: null,
}

export const EMPTY_FARMS_CTX: FarmCtxStateType = {
  farmsMapper: {},
  liveFarms: [],
  finishedFarms: [],
  liveStakedFarms: [],
  finishedStakedFarms: [],
}
