import {
  FARMS_LIVE_DATA_SUB,
  FARMS_FINISHED_DATA_SUB,
  FARMS_LIVE_STAKED_DATA_SUB,
  FARMS_FINISHED_STAKED_DATA_SUB,
  FARMS_DATA_SUB,
} from './helpers/farms.const'

export type FarmsProviderSubsType = {
  [FARMS_DATA_SUB]:
    | null
    | typeof FARMS_LIVE_DATA_SUB
    | typeof FARMS_FINISHED_DATA_SUB
    | typeof FARMS_LIVE_STAKED_DATA_SUB
    | typeof FARMS_FINISHED_STAKED_DATA_SUB
}

export type FarmRecordType = {}

export type FarmCtxStateType = {
  farmsMapper: Record<string, FarmRecordType>
  liveFarms: Array<string>
  finishedFarms: Array<string>
  liveStakedFarms: Array<string>
  finishedStakedFarms: Array<string>
}

export type NullableFarmCtxStateType = DeepNullable<FarmCtxStateType>

export type FarmsCtxType = FarmCtxStateType & {
  isLoading: boolean

  changeFarmsSubscriptionList: (newSkips: Partial<FarmsProviderSubsType>) => void
}
