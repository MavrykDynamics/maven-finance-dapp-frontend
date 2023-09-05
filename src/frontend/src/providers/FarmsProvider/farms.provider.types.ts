import {
  FARMS_LIVE_STAKED_DATA_SUB,
  FARMS_FINISHED_STAKED_DATA_SUB,
  FARMS_DATA_SUB,
  FARMS_ALL_DATA_SUB,
  FARMS_ALL_LIVE_DATA_SUB,
  DEPOSIT_TO_FARM_ACTION,
  HARVEST_FARM_REWARDS_ACTION,
  WITHDRAW_FROM_FARM_ACTION,
  FARMS_ALL_FINISHED_DATA_SUB,
} from './helpers/farms.const'
import { normalizeFarm } from './helpers/farms.normalizer'

export type FarmActionsType =
  | typeof HARVEST_FARM_REWARDS_ACTION
  | typeof DEPOSIT_TO_FARM_ACTION
  | typeof WITHDRAW_FROM_FARM_ACTION

export type FarmsProviderSubsType = {
  [FARMS_DATA_SUB]:
    | typeof FARMS_ALL_DATA_SUB
    | typeof FARMS_ALL_LIVE_DATA_SUB
    | typeof FARMS_LIVE_STAKED_DATA_SUB
    | typeof FARMS_ALL_FINISHED_DATA_SUB
    | typeof FARMS_FINISHED_STAKED_DATA_SUB
    | null
}

export type FarmRecordType = ReturnType<typeof normalizeFarm>

export type FarmCtxStateType = {
  farmsMapper: Record<string, FarmRecordType>
  allFarms: Array<string>
  allLiveFarms: Array<string>
  liveStakedFarms: Array<string>
  allFinishedFarms: Array<string>
  finishedStakedFarms: Array<string>
}

export type NullableFarmCtxStateType = DeepNullable<FarmCtxStateType>

export type FarmsCtxType = FarmCtxStateType & {
  isLoading: boolean

  changeFarmsSubscriptionList: (newSkips: Partial<FarmsProviderSubsType>) => void
}
