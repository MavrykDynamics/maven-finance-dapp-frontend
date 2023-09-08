import { FarmCtxStateType, FarmsProviderSubsType, NullableFarmCtxStateType } from '../farms.provider.types'

// farms view consts
export const STAKED = 1
export const NO_STAKED = 0
export const LIVE_TAB_ID = 1
export const FINISHED_TAB_ID = 2

// farms popups context
export const DEFAULT_FARMS_POPUPS_STATE = {
  depositPopup: {
    showModal: false,
    data: {
      selectedFarmAddress: '',
    },
  },
  withdrawPopup: {
    showModal: false,
    data: {
      selectedFarmAddress: '',
    },
  },
}

// farms subs
export const FARMS_ALL_DATA_SUB = 'FARMS_ALL_DATA_SUB'

export const FARMS_ALL_LIVE_DATA_SUB = 'FARMS_ALL_LIVE_DATA_SUB'
export const FARMS_LIVE_STAKED_DATA_SUB = 'FARMS__STAKED_LIVE_DATA_SUB'

export const FARMS_ALL_FINISHED_DATA_SUB = 'FARMS_ALL_FINISHED_DATA_SUB'
export const FARMS_FINISHED_STAKED_DATA_SUB = 'FARMS__FINISHED_LIVE_DATA_SUB'

export const FARMS_DATA_SUB = 'FARMS_DATA_SUB'

export const DEFAULT_FARMS_ACTIVE_SUBS: FarmsProviderSubsType = {
  [FARMS_DATA_SUB]: null,
}

// farms action
export const HARVEST_FARM_REWARDS_ACTION = 'HARVEST_FARM_REWARDS_ACTION'
export const DEPOSIT_TO_FARM_ACTION = 'DEPOSIT_TO_FARM_ACTION'
export const WITHDRAW_FROM_FARM_ACTION = 'WITHDRAW_FROM_FARM_ACTION'

// farms context
export const DEFAULT_FARMS_CTX: NullableFarmCtxStateType = {
  farmsMapper: null,
  allFinishedFarms: null,
  liveStakedFarms: null,
  allLiveFarms: null,
  finishedStakedFarms: null,
  allFarms: null,
}

export const EMPTY_FARMS_CTX: FarmCtxStateType = {
  farmsMapper: {},
  allFinishedFarms: [],
  liveStakedFarms: [],
  allLiveFarms: [],
  finishedStakedFarms: [],
  allFarms: [],
}
