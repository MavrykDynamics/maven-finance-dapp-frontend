import { replaceNullValuesWithDefault } from 'providers/common/utils/repalceNullValuesWithDefault'
import { DoormanContext, DoormanContextStateType, DoormanSubsRecordType } from '../doorman.provider.types'
import { EMPTY_DOORMAN_CTX, MVK_BALANCE_SUB, MVK_TOTAL_SUB, SMVK_HISTORY_SUB } from './doorman.consts'

type DoormanContextReturnValueArgs = {
  stakingCtxState: DoormanContextStateType
  changeStakingSubscriptionsList: DoormanContext['changeStakingSubscriptionsList']
  activeSubs: DoormanSubsRecordType
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

  /**
   * isLoading indicates whethet provider is loading smth, so we need to show loader, not load in background, cases:
   * 1. if we subscribe to smvk & mvk history data and data is empty
   * 2. if we subscribe to balances and balances are empty
   * 3. if we subscribe to total supply and total supply is empty
   * 4. if we don’t have active subs isLoading === true
   */
  const isLoading =
    (activeSubs[SMVK_HISTORY_SUB] && (mvkHistoryData === null || smvkHistoryData === null)) ||
    (activeSubs[MVK_BALANCE_SUB] && totalStakedMvk === null) ||
    (activeSubs[MVK_TOTAL_SUB] && (totalSupply === null || maximumTotalSupply === null)) ||
    !activeSubs[SMVK_HISTORY_SUB] ||
    !activeSubs[MVK_BALANCE_SUB] ||
    !activeSubs[MVK_TOTAL_SUB]

  // if provider is loading smth return loading true and default empty context (nonNullable)
  if (isLoading) {
    return {
      ...commonToReturn,
      ...EMPTY_DOORMAN_CTX,
      isLoading: true,
    }
  }

  // if subscribed data loaded return loading false and contextState where all null values replaced with nonNullable value
  const nonNullableProviderValue = replaceNullValuesWithDefault<DoormanContextStateType>(
    stakingCtxState,
    EMPTY_DOORMAN_CTX,
  )
  return {
    ...commonToReturn,
    ...nonNullableProviderValue,
    isLoading: false,
  }
}
