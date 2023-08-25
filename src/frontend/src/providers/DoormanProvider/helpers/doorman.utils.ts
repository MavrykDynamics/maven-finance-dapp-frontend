import { replaceNullValuesWithDefault } from 'providers/common/utils/repalceNullValuesWithDefault'
import {
  DoormanContext,
  DoormanContextStateType,
  NullableDoormanContextStateType,
  DoormanSubsRecordType,
} from '../doorman.provider.types'
import { EMPTY_DOORMAN_CTX, DAPP_MVK_SMVK_STATS_SUB } from './doorman.consts'

type DoormanContextReturnValueArgs = {
  stakingCtxState: NullableDoormanContextStateType
  changeStakingSubscriptionsList: DoormanContext['changeStakingSubscriptionsList']
  updateStakeHistoryData: DoormanContext['updateStakeHistoryData']
  activeSubs: DoormanSubsRecordType
}

export const getDoormanProviderReturnValue = ({
  stakingCtxState,
  changeStakingSubscriptionsList,
  activeSubs,
  updateStakeHistoryData,
}: DoormanContextReturnValueArgs) => {
  const { totalStakedMvk, totalSupply, maximumTotalSupply, mvkHistoryData, smvkHistoryData } = stakingCtxState

  const commonToReturn = {
    changeStakingSubscriptionsList,
    updateStakeHistoryData,
    mvkHistoryData,
    smvkHistoryData,
  }

  const isDappMvkSmvkDataEmpty = totalSupply === null || maximumTotalSupply === null || totalStakedMvk === null
  /**
   * isLoading indicates whethet provider is loading smth, so we need to show loader, not load in background, cases:
   * 1. if we subscribe to balances and balances are empty
   * 2. if we subscribe to total supply and total supply is empty
   * 3. if we don’t have active subs isLoading === true and default data is null
   */
  const isLoading =
    (activeSubs[DAPP_MVK_SMVK_STATS_SUB] && isDappMvkSmvkDataEmpty) ||
    (!activeSubs[DAPP_MVK_SMVK_STATS_SUB] && isDappMvkSmvkDataEmpty)

  // if provider is loading smth return loading true and default empty context (nonNullable)
  if (isLoading) {
    return {
      ...EMPTY_DOORMAN_CTX,
      ...commonToReturn,
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
