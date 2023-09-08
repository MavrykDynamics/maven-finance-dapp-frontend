import {
  BreakGlassCouncilStateType,
  BreakGlassCouncilSubsRecordType,
  NullableBreakGlassCouncilContextStateType,
} from '../breakGlassCouncil.types'

// actions
export const SET_ALL_CONTRACTS_ADMIN_ACTION = 'setAllContractsAdmin'
export const SET_SINGLE_CONTRACT_ADMIN_ACTION = 'setSingleContractAdmin'
export const SIGN_BREAK_GLASS_ACTION = 'signAction'
export const ADD_BREAK_GLASS_COUNCIL_MEMBER_ACTION = 'addCouncilMember'
export const UPDATE_BREAK_GLASS_COUNCIL_MEMBER_ACTION = 'updateCouncilMember'
export const CHANGE_BREAK_GLASS_COUNCIL_MEMBER_ACTION = 'changeCouncilMember'
export const REMOVE_BREAK_GLASS_COUNCIL_MEMBER_ACTION = 'removeCouncilMember'
export const PROPAGATE_BREAK_GLASS_ACTION = 'propagateBreakGlass'
export const DROP_BREAK_GLASS_ACTION = 'dropBreakGlass'

// subs
export const BG_COUNCIL_ACTIONS_DATA = ''

export const MY_BG_PAST_COUNCIL_ACTIONS_SUB = 'myBgPastCouncilActions'
export const MY_BG_ONGOING_COUNCIL_ACTIONS_SUB = 'myBgOngoingCouncilActions'
export const ALL_BG_PAST_COUNCIL_ACTIONS_SUB = 'allBgPastCouncilActions'
export const ALL_BG_ONGOING_COUNCIL_ACTIONS_SUB = 'allBgOngoingCouncilActions'

// PROVIDER DEFAULT CONSTS
export const DEFAULT_BREAK_GLASS_COUNCIL_ACTIVE_SUBS: BreakGlassCouncilSubsRecordType = {
  [BG_COUNCIL_ACTIONS_DATA]: null,
} as const

export const DEFAULT_FINANCIAL_REQUESTS_CTX: NullableBreakGlassCouncilContextStateType = {
  breakGlassCouncilMembers: null,
  allPendingActions: null,
  notMyPendingActions: null,
  myPendingActions: null,
  allPastActions: null,
  myPastActions: null,
  actionsMapper: null,
}
export const EMPTY_FINANCIAL_REQUESTS_CTX: BreakGlassCouncilStateType = {
  breakGlassCouncilMembers: [],
  allPendingActions: [],
  notMyPendingActions: [],
  myPendingActions: [],
  allPastActions: [],
  myPastActions: [],
  actionsMapper: {},
}
