// utils
import { isObjectChildrenNulls } from 'providers/common/utils/checkUtils'
import { replaceDeepNullValuesWithDefault } from 'providers/common/utils/repalceNullValuesWithDefault'

// types
import {
  CouncilContext,
  CouncilStateType,
  CouncilSubsRecordType,
  NullableCouncilContextStateType,
} from '../council.provider.types'
import {
  BG_COUNCIL_ACTIONS_DATA,
  BG_COUNCIL_MEMBERS_SUB,
  COUNCIL_ACTIONS_DATA,
  COUNCIL_MEMBERS_SUB,
  EMPTY_COUNCIL_CTX,
} from './council.consts'

type CouncilContextReturnValueArgs = {
  councilCtxState: NullableCouncilContextStateType
  changeCouncilSubscriptionList: CouncilContext['changeCouncilSubscriptionList']
  activeSubs: CouncilSubsRecordType
}

export const getCouncilProviderReturnValue = ({
  councilCtxState,
  changeCouncilSubscriptionList,
  activeSubs,
}: CouncilContextReturnValueArgs) => {
  const { councilMembers, breakGlassCouncilMembers, breakGlassCouncilActions, councilActions } = councilCtxState

  const commonToReturn = {
    changeCouncilSubscriptionList,
  }

  const isBgCounsilMembersLoading = activeSubs[BG_COUNCIL_MEMBERS_SUB] && breakGlassCouncilMembers === null
  const isMavCounsilMembersLoading = activeSubs[COUNCIL_MEMBERS_SUB] && councilMembers === null

  const isBgCounsilActionsLoading =
    activeSubs[BG_COUNCIL_ACTIONS_DATA] === null && isObjectChildrenNulls(councilActions)
  const isMavCounsilActionsLoading =
    activeSubs[COUNCIL_ACTIONS_DATA] === null && isObjectChildrenNulls(breakGlassCouncilActions)

  // TODO: think about initial
  const isLoading =
    isBgCounsilMembersLoading || isMavCounsilMembersLoading || isBgCounsilActionsLoading || isMavCounsilActionsLoading

  if (isLoading) {
    return {
      isLoading: true,
      ...commonToReturn,
      ...EMPTY_COUNCIL_CTX,
    }
  }

  // if subscribed data loaded return loading false and contextState where all null values replaced with nonNullable value
  const nonNullableProviderValue = replaceDeepNullValuesWithDefault<CouncilStateType>(
    councilCtxState,
    EMPTY_COUNCIL_CTX,
  )

  return {
    isLoading: false,
    ...commonToReturn,
    ...nonNullableProviderValue,
  }
}
