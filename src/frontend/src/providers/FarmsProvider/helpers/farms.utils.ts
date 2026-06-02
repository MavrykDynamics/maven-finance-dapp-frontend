// utils
import { buildProviderReturnValue } from 'providers/common/utils/buildProviderReturnValue'
import { convertNumberForClient, getNumberInBounds } from 'utils/calcFunctions'
import { checkWhetherTokenIsFarmToken } from 'providers/TokensProvider/helpers/tokens.utils'

// types
import {
  FarmCtxStateType,
  FarmRecordType,
  FarmsProviderSubsType,
  NullableFarmCtxStateType,
} from '../farms.provider.types'
import { TokenMetadataType } from 'providers/TokensProvider/tokens.provider.types'

// consts
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

  return buildProviderReturnValue(
    farmsCtxState,
    EMPTY_FARMS_CTX,
    { changeFarmsSubscriptionList },
    isLoading,
  )
}

/**
 * for calculateAPY & calculateAPR -> when we will have rates of lpTokens, try to use lpTokenBalance & currentRewardPerBlock in USD
 */
const BLOCKS_PER_YEAR = 1051200

export const calculateFarmAPY = (currentRewardPerBlock: number, lpTokenBalance: number) =>
  getNumberInBounds(0, 100, lpTokenBalance > 0 ? ((currentRewardPerBlock * BLOCKS_PER_YEAR) / lpTokenBalance) * 100 : 0)

export const calculateFarmAPR = (currentRewardPerBlock: number, blocksAmount: number, lpTokenBalance: number) =>
  getNumberInBounds(0, 100, lpTokenBalance > 0 ? ((currentRewardPerBlock * blocksAmount) / lpTokenBalance) * 100 : 0)

// get amount of tokens user've deposited to farm
export const getFarmUserDepositedAmount = ({
  farmDepositors,
  farmToken,
  userAddress,
  withoutConvertation,
}: {
  farmDepositors?: FarmRecordType['farmDepositors']
  farmToken?: TokenMetadataType | null
  userAddress: string | null
  withoutConvertation?: boolean
}): number => {
  if (!farmDepositors || !userAddress) return 0

  const unconvertedTokenAmount = farmDepositors[userAddress]?.depositedAmount ?? 0

  if (withoutConvertation) return unconvertedTokenAmount

  if (!farmToken || !checkWhetherTokenIsFarmToken(farmToken)) return 0

  return convertNumberForClient({ number: unconvertedTokenAmount, grade: farmToken.decimals })
}
