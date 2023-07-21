import { replaceNullValuesWithDefault } from 'providers/common/utils/repalceNullValuesWithDefault'
import { StakeContext, StakeContextStateType, StakingSubsRecordType } from '../stake.provider.types'
import { EMPTY_DOORMAN_CTX, MVK_BALANCE_SUB, MVK_TOTAL_SUB, SMVK_HISTORY_SUB } from './stake.consts'

type DoormanContextReturnValueArgs = {
  stakingCtxState: StakeContextStateType
  changeStakingSubscriptionsList: StakeContext['changeStakingSubscriptionsList']
  activeSubs: StakingSubsRecordType
}

export const getDoormanProviderReturnValue = ({
  stakingCtxState,
  changeStakingSubscriptionsList,
  activeSubs,
}: DoormanContextReturnValueArgs) => {
  const { totalStakedMvk, totalSupply, maximumTotalSupply, mvkHistoryData, smvkHistoryData } = stakingCtxState

  const commonToReturn = {
    changeStakingSubscriptionsList,
  }

  const isLoading =
    (activeSubs[SMVK_HISTORY_SUB] && (mvkHistoryData === null || smvkHistoryData === null)) ||
    (activeSubs[MVK_BALANCE_SUB] && totalStakedMvk === null) ||
    (activeSubs[MVK_TOTAL_SUB] && (totalSupply === null || maximumTotalSupply === null))

  // if provider is loading smth return loading true and default empty context (nonNullable)
  if (isLoading) {
    return {
      ...commonToReturn,
      ...EMPTY_DOORMAN_CTX,
      isLoading: true,
    }
  }

  // if subscribed data loaded return loading false and contextState where all null values replaced with nonNullable value
  const nonNullableProviderValue = replaceNullValuesWithDefault<StakeContextStateType>(
    stakingCtxState,
    EMPTY_DOORMAN_CTX,
  )
  return {
    ...commonToReturn,
    ...nonNullableProviderValue,
    isLoading: false,
  }
}
