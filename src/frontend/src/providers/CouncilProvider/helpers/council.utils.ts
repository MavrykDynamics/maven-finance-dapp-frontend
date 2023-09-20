// utils
import { replaceNullValuesWithDefault } from 'providers/common/utils/repalceNullValuesWithDefault'

// types
import {
  CouncilContext,
  CouncilStateType,
  CouncilSubsRecordType,
  NullableCouncilContextStateType,
} from '../council.provider.types'
import {
  ALL_BG_ONGOING_COUNCIL_ACTIONS_SUB,
  ALL_BG_PAST_COUNCIL_ACTIONS_SUB,
  ALL_ONGOING_COUNCIL_ACTIONS_SUB,
  ALL_PAST_COUNCIL_ACTIONS_SUB,
  BG_COUNCIL_ACTIONS_DATA,
  BG_COUNCIL_MEMBERS_SUB,
  COUNCIL_ACTIONS_DATA,
  COUNCIL_MEMBERS_SUB,
  EMPTY_COUNCIL_CTX,
  MY_BG_PAST_COUNCIL_ACTIONS_SUB,
  MY_PAST_COUNCIL_ACTIONS_SUB,
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

  // break glass and mavryk councils members loadings
  const isBgCounsilMembersLoading = activeSubs[BG_COUNCIL_MEMBERS_SUB] && breakGlassCouncilMembers === null
  const isMavCounsilMembersLoading = activeSubs[COUNCIL_MEMBERS_SUB] && councilMembers === null

  // mavryk council loadings
  const isMavCounsilPendingActionsLoading =
    activeSubs[COUNCIL_ACTIONS_DATA] === ALL_ONGOING_COUNCIL_ACTIONS_SUB && councilActions?.allPendingActions === null
  const isMavCounsilPastActionsLoading =
    activeSubs[COUNCIL_ACTIONS_DATA] === ALL_PAST_COUNCIL_ACTIONS_SUB && councilActions?.allPastActions === null
  const isMavCounsilMyPastActionsLoading =
    activeSubs[COUNCIL_ACTIONS_DATA] === MY_PAST_COUNCIL_ACTIONS_SUB && councilActions?.myPastActions === null

  // break glass council loadings
  const isBgCounsilPendingActionsLoading =
    activeSubs[BG_COUNCIL_ACTIONS_DATA] === ALL_BG_ONGOING_COUNCIL_ACTIONS_SUB &&
    breakGlassCouncilActions?.allPendingActions === null
  const isBgCounsilPastActionsLoading =
    activeSubs[BG_COUNCIL_ACTIONS_DATA] === ALL_BG_PAST_COUNCIL_ACTIONS_SUB &&
    breakGlassCouncilActions?.allPastActions === null
  const isBgCounsilMyPastActionsLoading =
    activeSubs[BG_COUNCIL_ACTIONS_DATA] === MY_BG_PAST_COUNCIL_ACTIONS_SUB &&
    breakGlassCouncilActions?.myPastActions === null

  const isLoading =
    isBgCounsilMembersLoading ||
    isBgCounsilPendingActionsLoading ||
    isBgCounsilPastActionsLoading ||
    isBgCounsilMyPastActionsLoading ||
    isMavCounsilMembersLoading ||
    isMavCounsilPendingActionsLoading ||
    isMavCounsilPastActionsLoading ||
    isMavCounsilMyPastActionsLoading

  if (isLoading) {
    return {
      isLoading: true,
      ...commonToReturn,
      ...EMPTY_COUNCIL_CTX,
    }
  }

  // if subscribed data loaded return loading false and contextState where all null values replaced with nonNullable value
  const nonNullableProviderValue = replaceNullValuesWithDefault<CouncilStateType>(councilCtxState, EMPTY_COUNCIL_CTX)

  return {
    isLoading: false,
    ...commonToReturn,
    ...nonNullableProviderValue,
  }
}
