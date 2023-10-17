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
  BgCounsilDdForms,
  DROP_COUNCIL_ACTION_FORM,
  MavrykCounsilDdForms,
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

  // break glass and mavryk councils members loadings
  const isBgCounsilMembersLoading = activeSubs[BG_COUNCIL_MEMBERS_SUB] && breakGlassCouncilMembers === null
  const isMavCounsilMembersLoading = activeSubs[COUNCIL_MEMBERS_SUB] && councilMembers === null

  // mavryk council loadings
  const isMavCounsilPendingActionsLoading =
    activeSubs[COUNCIL_ACTIONS_DATA] === ALL_ONGOING_COUNCIL_ACTIONS_SUB && councilActions?.allPendingActions === null
  const isMavCounsilPastActionsLoading =
    activeSubs[COUNCIL_ACTIONS_DATA] === ALL_PAST_COUNCIL_ACTIONS_SUB && councilActions?.allPastActions === null
  const isMavCounsilMyPastActionsLoading =
    activeSubs[COUNCIL_ACTIONS_DATA] === MY_PAST_COUNCIL_ACTIONS_SUB &&
    (councilActions?.myPastActions === null || councilActions?.actionsToSign === null)
  const isMavCounsilMyOngoingActionsLoading =
    activeSubs[COUNCIL_ACTIONS_DATA] === ALL_ONGOING_COUNCIL_ACTIONS_SUB &&
    (councilActions?.myPendingActions === null || councilActions?.actionsToSign === null)

  // break glass council loadings
  const isBgCounsilPendingActionsLoading =
    activeSubs[BG_COUNCIL_ACTIONS_DATA] === ALL_BG_ONGOING_COUNCIL_ACTIONS_SUB &&
    breakGlassCouncilActions?.allPendingActions === null
  const isBgCounsilPastActionsLoading =
    activeSubs[BG_COUNCIL_ACTIONS_DATA] === ALL_BG_PAST_COUNCIL_ACTIONS_SUB &&
    breakGlassCouncilActions?.allPastActions === null
  const isBgCounsilMyPastActionsLoading =
    activeSubs[BG_COUNCIL_ACTIONS_DATA] === MY_BG_PAST_COUNCIL_ACTIONS_SUB &&
    (breakGlassCouncilActions?.myPastActions === null || breakGlassCouncilActions?.actionsToSign === null)
  const isBgCounsilMyOngoingActionsLoading =
    activeSubs[BG_COUNCIL_ACTIONS_DATA] === ALL_BG_ONGOING_COUNCIL_ACTIONS_SUB &&
    (breakGlassCouncilActions?.myPendingActions === null || breakGlassCouncilActions?.actionsToSign === null)

  const isLoading =
    isBgCounsilMembersLoading ||
    isBgCounsilPendingActionsLoading ||
    isBgCounsilPastActionsLoading ||
    isBgCounsilMyPastActionsLoading ||
    isBgCounsilMyOngoingActionsLoading ||
    isMavCounsilMembersLoading ||
    isMavCounsilPendingActionsLoading ||
    isMavCounsilPastActionsLoading ||
    isMavCounsilMyPastActionsLoading ||
    isMavCounsilMyOngoingActionsLoading

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
 * @param actionName action name from indexer
 * @returns action id on client
 *
 * NOTE: if action name will change on back-end it will lead to returning null from switch, so need to keep up to date with back-end
 */
export const getClientActionIdByIndexerActionType = (actionType: string, isBreakGlassCouncil: boolean) => {
  switch (actionType) {
    // ------- COUNCIL MEMBERS ACTIONS
    case 'addCouncilMember':
      return isBreakGlassCouncil ? BgCounsilDdForms.BG_ADD_COUNCIL_MEMBER : MavrykCounsilDdForms.ADD_COUNCIL_MEMBER
    case 'changeCouncilMember':
      return isBreakGlassCouncil
        ? BgCounsilDdForms.BG_CHANGE_COUNCIL_MEMBER
        : MavrykCounsilDdForms.CHANGE_COUNCIL_MEMBER
    case 'removeCouncilMember':
      return isBreakGlassCouncil
        ? BgCounsilDdForms.BG_REMOVE_COUNCIL_MEMBER
        : MavrykCounsilDdForms.REMOVE_COUNCIL_MEMBER

    // ------- MAVRYK COUNCIL VESTEES FORMS
    case 'addVestee':
      return MavrykCounsilDdForms.ADD_VESTEE
    case 'updateVestee':
      return MavrykCounsilDdForms.UPDATE_VESTEE
    case 'toggleVesteeLock':
      return MavrykCounsilDdForms.TOGGLE_VESTEE_LOCK
    case 'removeVestee':
      return MavrykCounsilDdForms.REMOVE_VESTEE

    // ------- MAVRYK COUNCIL TOKENS FORMS
    case 'requestTokens':
      return MavrykCounsilDdForms.REQUEST_TOKENS
    case 'requestMint':
      return MavrykCounsilDdForms.REQUEST_TOKEN_MINT
    case 'transfer':
      return MavrykCounsilDdForms.TRANSFER_TOKENS

    // ------- MAVRYK COUNCIL BAKERS FORMS
    case 'setBaker':
      return MavrykCounsilDdForms.SET_BAKER
    case 'setContractBaker':
      return MavrykCounsilDdForms.SET_CONTRACT_BAKER

    // ------- MAVRYK COUNCIL OTHER FORMS
    case 'dropFinancialRequest':
      return MavrykCounsilDdForms.DROP_FINANCIAL_REQUEST

    // ------- BREAK GLASS COUNCIL CONTRACTS ADMIN FORM
    case 'setContractsAdmin':
      return BgCounsilDdForms.SET_MULTIPLE_CONTRACTS_ADMIN

    // ------- BREAK GLASS COUNCIL CONTRACTS OTHER FORMS
    case 'removeBreakGlassControl':
      return BgCounsilDdForms.REMOVE_BREAK_GLASS_CONTROLL
    case 'unpauseAllEntrypoints':
      return BgCounsilDdForms.UNPAUSE_ALL_ENTRYPOINTS
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
