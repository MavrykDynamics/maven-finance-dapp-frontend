import { CouncilStateType, CouncilSubsRecordType, NullableCouncilContextStateType } from '../council.provider.types'

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
export const BG_COUNCIL_ACTIONS_DATA = 'BG_COUNCIL_ACTIONS_DATA'
export const COUNCIL_ACTIONS_DATA = 'COUNCIL_ACTIONS_DATA'
export const COUNCIL_MEMBERS_SUB = 'COUNCIL_MEMBERS_SUB'
export const BREAK_GLASS_COUNCIL_MEMBERS_SUB = 'BREAK_GLASS_COUNCIL_MEMBERS_SUB'

// break glass
export const MY_BG_PAST_COUNCIL_ACTIONS_SUB = 'myBgPastCouncilActions'
export const MY_BG_ONGOING_COUNCIL_ACTIONS_SUB = 'myBgOngoingCouncilActions'
export const ALL_BG_PAST_COUNCIL_ACTIONS_SUB = 'allBgPastCouncilActions'
export const ALL_BG_ONGOING_COUNCIL_ACTIONS_SUB = 'allBgOngoingCouncilActions'

// council
export const MY_PAST_COUNCIL_ACTIONS_SUB = 'myPastCouncilActions'
export const MY_ONGOING_COUNCIL_ACTIONS_SUB = 'myOngoingCouncilActions'
export const ALL_PAST_COUNCIL_ACTIONS_SUB = 'allPastCouncilActions'
export const ALL_ONGOING_COUNCIL_ACTIONS_SUB = 'allOngoingCouncilActions'

// PROVIDER DEFAULT CONSTS
export const DEFAULT_COUNCIL_ACTIVE_SUBS: CouncilSubsRecordType = {
  [BG_COUNCIL_ACTIONS_DATA]: null,
  [COUNCIL_ACTIONS_DATA]: null,
  [COUNCIL_MEMBERS_SUB]: false,
  [BREAK_GLASS_COUNCIL_MEMBERS_SUB]: false,
} as const

const NULLABLE_COUNCIL_ACTIONS_DATA = {
  allPendingActions: null,
  notMyPendingActions: null,
  myPendingActions: null,
  allPastActions: null,
  myPastActions: null,
  actionsMapper: null,
}
const EMPTY_COUNCIL_ACTIONS_DATA = {
  allPendingActions: [],
  notMyPendingActions: [],
  myPendingActions: [],
  allPastActions: [],
  myPastActions: [],
  actionsMapper: {},
}

export const DEFAULT_COUNCIL_CTX: NullableCouncilContextStateType = {
  breakGlassCouncilMembers: null,
  councilMembers: null,
  councilActions: NULLABLE_COUNCIL_ACTIONS_DATA,
  breakGlassCouncilActions: NULLABLE_COUNCIL_ACTIONS_DATA,
}

export const EMPTY_COUNCIL_CTX: CouncilStateType = {
  breakGlassCouncilMembers: [],
  councilMembers: [],
  councilActions: EMPTY_COUNCIL_ACTIONS_DATA,
  breakGlassCouncilActions: EMPTY_COUNCIL_ACTIONS_DATA,
}
