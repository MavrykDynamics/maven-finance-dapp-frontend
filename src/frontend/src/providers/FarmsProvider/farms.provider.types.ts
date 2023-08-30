import {
  FARMS_LIVE_NOT_STAKED_DATA_SUB,
  FARMS_FINISHED_NOT_STAKED_DATA_SUB,
  FARMS_LIVE_STAKED_DATA_SUB,
  FARMS_FINISHED_STAKED_DATA_SUB,
  FARMS_DATA_SUB,
  FARMS_ALL_DATA_SUB,
} from './helpers/farms.const'
import { normalizeFarm } from './helpers/farms.normalizer'

export type FarmsProviderSubsType = {
  [FARMS_DATA_SUB]:
    | typeof FARMS_ALL_DATA_SUB
    | typeof FARMS_LIVE_NOT_STAKED_DATA_SUB
    | typeof FARMS_LIVE_STAKED_DATA_SUB
    | typeof FARMS_FINISHED_NOT_STAKED_DATA_SUB
    | typeof FARMS_FINISHED_STAKED_DATA_SUB
    | null
}

export type FarmRecordType = ReturnType<typeof normalizeFarm>

export type FarmCtxStateType = {
  farmsMapper: Record<string, FarmRecordType>
  allFarms: Array<string>
  liveNotStakedFarms: Array<string>
  finishedNotStakedFarms: Array<string>
  liveStakedFarms: Array<string>
  finishedStakedFarms: Array<string>
}

export type NullableFarmCtxStateType = DeepNullable<FarmCtxStateType>

export type FarmsCtxType = FarmCtxStateType & {
  isLoading: boolean

  changeFarmsSubscriptionList: (newSkips: Partial<FarmsProviderSubsType>) => void
}
