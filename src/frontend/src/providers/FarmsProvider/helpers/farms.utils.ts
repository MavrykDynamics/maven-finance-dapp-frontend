import { replaceNullValuesWithDefault } from 'providers/common/utils/repalceNullValuesWithDefault'
import { FarmCtxStateType, FarmsProviderSubsType, NullableFarmCtxStateType } from '../farms.provider.types'
import {
  EMPTY_FARMS_CTX,
  FARMS_DATA_SUB,
  FARMS_FINISHED_NOT_STAKED_DATA_SUB,
  FARMS_FINISHED_STAKED_DATA_SUB,
  FARMS_LIVE_NOT_STAKED_DATA_SUB,
  FARMS_LIVE_STAKED_DATA_SUB,
} from './farms.const'

export const getFarmsReturnValue = ({
  farmsCtxState,
  changeFarmsSubscriptionList,
  activeSubs,
}: {
  farmsCtxState: NullableFarmCtxStateType
  changeFarmsSubscriptionList: (newSkips: Partial<FarmsProviderSubsType>) => void
  activeSubs: FarmsProviderSubsType
}) => {
  const { farmsMapper, liveNotStakedFarms, liveStakedFarms, finishedNotStakedFarms, finishedStakedFarms } =
    farmsCtxState

  const commonToReturn = {
    changeFarmsSubscriptionList,
  }

  const isLiveFarmsLoading =
    activeSubs[FARMS_DATA_SUB] === FARMS_LIVE_NOT_STAKED_DATA_SUB && liveNotStakedFarms === null
  const isLiveStakedFarmsLoading = activeSubs[FARMS_DATA_SUB] === FARMS_LIVE_STAKED_DATA_SUB && liveStakedFarms === null
  const isFinishedFarmsLoading =
    activeSubs[FARMS_DATA_SUB] === FARMS_FINISHED_NOT_STAKED_DATA_SUB && finishedNotStakedFarms === null
  const isFinishedStakedFarmsLoading =
    activeSubs[FARMS_DATA_SUB] === FARMS_FINISHED_STAKED_DATA_SUB && finishedStakedFarms === null

  const isLoading =
    (activeSubs[FARMS_DATA_SUB] !== null && farmsMapper === null) ||
    isLiveFarmsLoading ||
    isLiveStakedFarmsLoading ||
    isFinishedFarmsLoading ||
    isFinishedStakedFarmsLoading

  if (isLoading) {
    return {
      ...commonToReturn,
      ...EMPTY_FARMS_CTX,
      isLoading: true,
    }
  }

  const nonNullableProviderValue = replaceNullValuesWithDefault<FarmCtxStateType>(farmsCtxState, EMPTY_FARMS_CTX)

  return {
    ...commonToReturn,
    ...nonNullableProviderValue,
    isLoading: false,
  }
}
