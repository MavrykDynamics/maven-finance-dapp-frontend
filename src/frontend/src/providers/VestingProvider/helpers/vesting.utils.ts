import { replaceNullValuesWithDefault } from 'providers/common/utils/repalceNullValuesWithDefault'
import {
  NullableVestingContextStateType,
  VestingContext,
  VestingContextStateType,
  VestingSubsRecordType,
} from '../vesting.provider.types'
import { EMPTY_VESTING_CTX, VESTING_STORAGE_DATA_SUB } from './vesting.consts'

export const getVestingProviderReturnValue = ({
  vestingCtxState,
  changeVestingSubscriptionsList,
  activeSubs,
}: {
  vestingCtxState: NullableVestingContextStateType
  changeVestingSubscriptionsList: VestingContext['changeVestingSubscriptionsList']
  activeSubs: VestingSubsRecordType
}) => {
  const { address, vesteesMapper, vesteeIds } = vestingCtxState
  const commonToReturn = {
    changeVestingSubscriptionsList,
  }

  const isVestingEmpty = vesteesMapper === null || vesteeIds === null || address === null
  const isLoading =
    (activeSubs[VESTING_STORAGE_DATA_SUB] && isVestingEmpty) ||
    (!activeSubs[VESTING_STORAGE_DATA_SUB] && isVestingEmpty)

  // if provider is loading smth return loading true and default empty context (nonNullable)
  if (isLoading) {
    return {
      ...commonToReturn,
      ...EMPTY_VESTING_CTX,
      isLoading: true,
    }
  }
  // if subscribed data loaded return loading false and contextState where all null values replaced with nonNullable value
  const nonNullableProviderValue = replaceNullValuesWithDefault<VestingContextStateType>(
    vestingCtxState,
    EMPTY_VESTING_CTX,
  )
  return {
    ...commonToReturn,
    ...nonNullableProviderValue,
    isLoading: false,
  }
}
