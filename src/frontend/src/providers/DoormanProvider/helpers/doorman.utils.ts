import { buildProviderReturnValue } from 'providers/common/utils/buildProviderReturnValue'
import {
  DoormanContext,
  DoormanSubsRecordType,
  NullableDoormanContextStateType,
} from '../doorman.provider.types'
import { DAPP_MVN_SMVN_STATS_SUB, EMPTY_DOORMAN_CTX } from './doorman.consts'

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
  const { totalStakedMvn, totalSupply, maximumTotalSupply, mvnHistoryData, smvnHistoryData } = stakingCtxState

  const isDappMvnSmvnDataEmpty = totalSupply === null || maximumTotalSupply === null || totalStakedMvn === null
  const isLoading =
    (activeSubs[DAPP_MVN_SMVN_STATS_SUB] && isDappMvnSmvnDataEmpty) ||
    (!activeSubs[DAPP_MVN_SMVN_STATS_SUB] && isDappMvnSmvnDataEmpty)

  return buildProviderReturnValue(
    stakingCtxState,
    EMPTY_DOORMAN_CTX,
    {
      changeStakingSubscriptionsList,
      updateStakeHistoryData,
      mvnHistoryData,
      smvnHistoryData,
    },
    Boolean(isLoading),
  )
}
