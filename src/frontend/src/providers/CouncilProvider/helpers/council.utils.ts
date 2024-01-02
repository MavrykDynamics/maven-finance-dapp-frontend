// utils
import { replaceNullValuesWithDefault } from 'providers/common/utils/repalceNullValuesWithDefault'

// types
import {
  CouncilContext,
  CouncilStateType,
  CouncilSubsRecordType,
  NullableCouncilContextStateType,
} from '../council.provider.types'

// consts
import {
  ALL_BG_ONGOING_COUNCIL_ACTIONS_SUB,
  ALL_BG_PAST_COUNCIL_ACTIONS_SUB,
  ALL_ONGOING_COUNCIL_ACTIONS_SUB,
  ALL_PAST_COUNCIL_ACTIONS_SUB,
  BG_COUNCIL_ACTIONS_DATA,
  BG_COUNCIL_MEMBERS_SUB,
  COUNCIL_ACTIONS_DATA,
  COUNCIL_ACTIONS_PARAMS_MAPPER,
  COUNCIL_MEMBERS_SUB,
  EMPTY_COUNCIL_CTX,
  MY_BG_PAST_COUNCIL_ACTIONS_SUB,
  MY_PAST_COUNCIL_ACTIONS_SUB,
} from './council.consts'
import {
  BgCouncilDdForms,
  DROP_COUNCIL_ACTION_FORM,
  MavenCouncilDdForms,
  PROPAGATE_BREAK_GLASS_ACTION_FORM,
} from 'pages/Council/helpers/council.consts'
import { CouncilActionParamsNames } from './council.types'

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

  // break glass and maven councils members loadings
  const isBgCouncilMembersLoading = activeSubs[BG_COUNCIL_MEMBERS_SUB] && breakGlassCouncilMembers === null
  const isMavCouncilMembersLoading = activeSubs[COUNCIL_MEMBERS_SUB] && councilMembers === null

  // maven council loadings
  const isMavCouncilPendingActionsLoading =
    activeSubs[COUNCIL_ACTIONS_DATA] === ALL_ONGOING_COUNCIL_ACTIONS_SUB && councilActions?.allPendingActions === null
  const isMavCouncilPastActionsLoading =
    activeSubs[COUNCIL_ACTIONS_DATA] === ALL_PAST_COUNCIL_ACTIONS_SUB && councilActions?.allPastActions === null
  const isMavCouncilMyPastActionsLoading =
    activeSubs[COUNCIL_ACTIONS_DATA] === MY_PAST_COUNCIL_ACTIONS_SUB &&
    (councilActions?.myPastActions === null || councilActions?.actionsToSign === null)
  const isMavCouncilMyOngoingActionsLoading =
    activeSubs[COUNCIL_ACTIONS_DATA] === ALL_ONGOING_COUNCIL_ACTIONS_SUB &&
    (councilActions?.myPendingActions === null || councilActions?.actionsToSign === null)

  // break glass council loadings
  const isBgCouncilPendingActionsLoading =
    activeSubs[BG_COUNCIL_ACTIONS_DATA] === ALL_BG_ONGOING_COUNCIL_ACTIONS_SUB &&
    breakGlassCouncilActions?.allPendingActions === null
  const isBgCouncilPastActionsLoading =
    activeSubs[BG_COUNCIL_ACTIONS_DATA] === ALL_BG_PAST_COUNCIL_ACTIONS_SUB &&
    breakGlassCouncilActions?.allPastActions === null
  const isBgCouncilMyPastActionsLoading =
    activeSubs[BG_COUNCIL_ACTIONS_DATA] === MY_BG_PAST_COUNCIL_ACTIONS_SUB &&
    (breakGlassCouncilActions?.myPastActions === null || breakGlassCouncilActions?.actionsToSign === null)
  const isBgCouncilMyOngoingActionsLoading =
    activeSubs[BG_COUNCIL_ACTIONS_DATA] === ALL_BG_ONGOING_COUNCIL_ACTIONS_SUB &&
    (breakGlassCouncilActions?.myPendingActions === null || breakGlassCouncilActions?.actionsToSign === null)

  const isLoading =
    isBgCouncilMembersLoading ||
    isBgCouncilPendingActionsLoading ||
    isBgCouncilPastActionsLoading ||
    isBgCouncilMyPastActionsLoading ||
    isBgCouncilMyOngoingActionsLoading ||
    isMavCouncilMembersLoading ||
    isMavCouncilPendingActionsLoading ||
    isMavCouncilPastActionsLoading ||
    isMavCouncilMyPastActionsLoading ||
    isMavCouncilMyOngoingActionsLoading

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

/**
 * helper to get action id on client and then use this id for getting grid styles for output, etc
 *
 * @returns action id on client
 *
 * NOTE: if action name will change on back-end it will lead to returning null from switch, so need to keep up to date with back-end
 * @param actionType
 * @param isBreakGlassCouncil
 */
export const getClientActionIdByIndexerActionType = (actionType: string, isBreakGlassCouncil: boolean) => {
  switch (actionType) {
    // ------- COUNCIL MEMBERS ACTIONS
    case 'addCouncilMember':
      return isBreakGlassCouncil ? BgCouncilDdForms.BG_ADD_COUNCIL_MEMBER : MavenCouncilDdForms.ADD_COUNCIL_MEMBER
    case 'changeCouncilMember':
      return isBreakGlassCouncil ? BgCouncilDdForms.BG_CHANGE_COUNCIL_MEMBER : MavenCouncilDdForms.CHANGE_COUNCIL_MEMBER
    case 'removeCouncilMember':
      return isBreakGlassCouncil ? BgCouncilDdForms.BG_REMOVE_COUNCIL_MEMBER : MavenCouncilDdForms.REMOVE_COUNCIL_MEMBER

    // ------- MAVEN COUNCIL VESTEES FORMS
    case 'addVestee':
      return MavenCouncilDdForms.ADD_VESTEE
    case 'updateVestee':
      return MavenCouncilDdForms.UPDATE_VESTEE
    case 'toggleVesteeLock':
      return MavenCouncilDdForms.TOGGLE_VESTEE_LOCK
    case 'removeVestee':
      return MavenCouncilDdForms.REMOVE_VESTEE

    // ------- MAVEN COUNCIL TOKENS FORMS
    case 'requestTokens':
      return MavenCouncilDdForms.REQUEST_TOKENS
    case 'requestMint':
      return MavenCouncilDdForms.REQUEST_TOKEN_MINT
    case 'transfer':
      return MavenCouncilDdForms.TRANSFER_TOKENS

    // ------- MAVEN COUNCIL BAKERS FORMS
    case 'setBaker':
      return MavenCouncilDdForms.SET_BAKER
    case 'setContractBaker':
      return MavenCouncilDdForms.SET_CONTRACT_BAKER

    // ------- MAVEN COUNCIL OTHER FORMS
    case 'dropFinancialRequest':
      return MavenCouncilDdForms.DROP_FINANCIAL_REQUEST

    // ------- BREAK GLASS COUNCIL CONTRACTS ADMIN FORM
    case 'setContractsAdmin':
      return BgCouncilDdForms.SET_MULTIPLE_CONTRACTS_ADMIN

    // ------- BREAK GLASS COUNCIL CONTRACTS OTHER FORMS
    case 'removeBreakGlassControl':
      return BgCouncilDdForms.REMOVE_BREAK_GLASS_CONTROL
    case 'unpauseAllEntrypoints':
      return BgCouncilDdForms.UNPAUSE_ALL_ENTRYPOINTS
    case 'propagateBreakGlass':
      return PROPAGATE_BREAK_GLASS_ACTION_FORM

    case 'flushAction':
      return DROP_COUNCIL_ACTION_FORM

    default:
      return null
  }
}

export const checkWhetherActionParamValid = (actionParamName: string): actionParamName is CouncilActionParamsNames =>
  Boolean(COUNCIL_ACTIONS_PARAMS_MAPPER[actionParamName as CouncilActionParamsNames])
