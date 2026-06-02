import { buildProviderReturnValue } from 'providers/common/utils/buildProviderReturnValue'
import {
  NullableVestingContextStateType,
  VestingContext,
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
  const { address, vesteesMapper, vesteesAddresses } = vestingCtxState

  const isVestingEmpty = vesteesMapper === null || vesteesAddresses === null || address === null
  const isLoading =
    (activeSubs[VESTING_STORAGE_DATA_SUB] && isVestingEmpty) ||
    (!activeSubs[VESTING_STORAGE_DATA_SUB] && isVestingEmpty)

  return buildProviderReturnValue(
    vestingCtxState,
    EMPTY_VESTING_CTX,
    { changeVestingSubscriptionsList },
    Boolean(isLoading),
  )
}
