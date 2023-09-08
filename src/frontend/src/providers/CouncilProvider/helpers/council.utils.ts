import { replaceNullValuesWithDefault } from 'providers/common/utils/repalceNullValuesWithDefault'

import {
  CouncilContext,
  CouncilStateType,
  CouncilSubsRecordType,
  NullableCouncilContextStateType,
} from '../council.provider.types'
import {
  BG_COUNCIL_ACTIONS_DATA,
  BREAK_GLASS_COUNCIL_MEMBERS_SUB,
  COUNCIL_ACTIONS_DATA,
  COUNCIL_MEMBERS_SUB,
  EMPTY_COUNCIL_CTX,
} from './council.consts'

function checkObjectValuesForNull(obj: Record<string, unknown>) {
  return Object.values(obj).every((el) => el === null)
}

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
  // council & bg council members loading statuses
  const areCouncilMembersLoading =
    (activeSubs[COUNCIL_MEMBERS_SUB] && councilMembers === null) ||
    (!activeSubs[COUNCIL_MEMBERS_SUB] && councilMembers === null)

  const areBreakGlassCouncilMembersLoading =
    (activeSubs[BREAK_GLASS_COUNCIL_MEMBERS_SUB] && breakGlassCouncilMembers === null) ||
    (!activeSubs[BREAK_GLASS_COUNCIL_MEMBERS_SUB] && breakGlassCouncilMembers === null)

  // council & bg council actions loading statuses
  const areCouncilActionsLoading =
    (activeSubs[COUNCIL_ACTIONS_DATA] !== null && checkObjectValuesForNull(councilActions)) ||
    (activeSubs[COUNCIL_ACTIONS_DATA] === null && checkObjectValuesForNull(councilActions))

  const areBreakGlassCouncilActionsLoading =
    (activeSubs[BG_COUNCIL_ACTIONS_DATA] !== null && checkObjectValuesForNull(breakGlassCouncilActions)) ||
    (activeSubs[BG_COUNCIL_ACTIONS_DATA] === null && checkObjectValuesForNull(breakGlassCouncilActions))

  if (areCouncilMembersLoading) {
    return {
      ...councilCtxState,
      councilMembers: EMPTY_COUNCIL_CTX.councilMembers,
      ...commonToReturn,
      areCouncilMembersLoading: true,
    }
  }

  if (areBreakGlassCouncilMembersLoading) {
    return {
      ...councilCtxState,
      councilMembers: EMPTY_COUNCIL_CTX.breakGlassCouncilMembers,
      ...commonToReturn,
      areBreakGlassCouncilMembersLoading: true,
    }
  }

  if (areCouncilActionsLoading) {
    return {
      ...councilCtxState,
      councilMembers: EMPTY_COUNCIL_CTX.councilActions,
      ...commonToReturn,
      areCouncilActionsLoading: true,
    }
  }

  if (areBreakGlassCouncilActionsLoading) {
    return {
      ...councilCtxState,
      councilMembers: EMPTY_COUNCIL_CTX.breakGlassCouncilActions,
      ...commonToReturn,
      areBreakGlassCouncilActionsLoading: true,
    }
  }

  // if subscribed data loaded return loading false and contextState where all null values replaced with nonNullable value
  const nonNullableProviderValue = replaceNullValuesWithDefault<CouncilStateType>(councilCtxState, EMPTY_COUNCIL_CTX)

  return {
    ...commonToReturn,
    ...nonNullableProviderValue,
    areCouncilActionsLoading: false,
    areBreakGlassActionsLoading: false,
    areCouncilBreakGlassMembersLoading: false,
    areCouncilMembersLoading: false,
  }
}
