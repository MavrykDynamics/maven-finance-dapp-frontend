import { replaceNullValuesWithDefault } from 'providers/common/utils/repalceNullValuesWithDefault'
import {
  FarmCtxStateType,
  FarmRecordType,
  FarmsProviderSubsType,
  NullableFarmCtxStateType,
} from '../farms.provider.types'
import {
  EMPTY_FARMS_CTX,
  FARMS_DATA_SUB,
  FARMS_ALL_FINISHED_DATA_SUB,
  FARMS_FINISHED_STAKED_DATA_SUB,
  FARMS_ALL_LIVE_DATA_SUB,
  FARMS_LIVE_STAKED_DATA_SUB,
} from './farms.const'

// get provider value
export const getFarmsReturnValue = ({
  farmsCtxState,
  changeFarmsSubscriptionList,
  activeSubs,
}: {
  farmsCtxState: NullableFarmCtxStateType
  changeFarmsSubscriptionList: (newSkips: Partial<FarmsProviderSubsType>) => void
  activeSubs: FarmsProviderSubsType
}) => {
  const { farmsMapper, allLiveFarms, liveStakedFarms, allFinishedFarms, finishedStakedFarms } = farmsCtxState

  const commonToReturn = {
    changeFarmsSubscriptionList,
  }

  const isLiveFarmsLoading = activeSubs[FARMS_DATA_SUB] === FARMS_ALL_LIVE_DATA_SUB && allLiveFarms === null
  const isLiveStakedFarmsLoading = activeSubs[FARMS_DATA_SUB] === FARMS_LIVE_STAKED_DATA_SUB && liveStakedFarms === null
  const isFinishedFarmsLoading = activeSubs[FARMS_DATA_SUB] === FARMS_ALL_FINISHED_DATA_SUB && allFinishedFarms === null
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

const BLOCKS_PER_YEAR = 1051200

// TODO: this functions calc apy and apr in LPTokens, but we need in USD, check with Sam
export const calculateAPY = (currentRewardPerBlock: number, lpTokenBalance: number): number => {
  return lpTokenBalance > 0 ? ((currentRewardPerBlock * BLOCKS_PER_YEAR) / lpTokenBalance) * 100 : 0
}

// TODO: this functions calc apy and apr in LPTokens, but we need in USD, check with Sam
export const calculateAPR = (currentRewardPerBlock: number, blocksAmount: number, lpTokenBalance: number): number => {
  return lpTokenBalance > 0 ? ((currentRewardPerBlock * blocksAmount) / lpTokenBalance) * 100 : 0
}

// get amount of tokens user've deposited to farm
export const getFarmUserDepositedAmount = (
  farmAccounts: FarmRecordType['farmDepositors'],
  userAddress: string | null,
): number => {
  if (!userAddress) return 0
  return farmAccounts.find(({ address }) => userAddress === address, 0)?.depositedAmount ?? 0
}
