import {
  CouncilActionsRecordType,
  CouncilStateType,
  CouncilSubsRecordType,
  NullableCouncilActionsRecordType,
  NullableCouncilContextStateType,
} from '../council.provider.types'

// BG council actions
export const SET_ALL_CONTRACTS_ADMIN_ACTION = 'setAllContractsAdmin'
export const SET_SINGLE_CONTRACT_ADMIN_ACTION = 'setSingleContractAdmin'
export const SIGN_BREAK_GLASS_COUNCIL_ACTION = 'signAction'
export const ADD_BREAK_GLASS_COUNCIL_MEMBER_ACTION = 'addCouncilMember'
export const UPDATE_BREAK_GLASS_COUNCIL_MEMBER_ACTION = 'updateCouncilMember'
export const CHANGE_BREAK_GLASS_COUNCIL_MEMBER_ACTION = 'changeCouncilMember'
export const REMOVE_BREAK_GLASS_COUNCIL_MEMBER_ACTION = 'removeCouncilMember'
export const PROPAGATE_BREAK_GLASS_ACTION = 'propagateBreakGlass'
export const DROP_BREAK_GLASS_COUNCIL_REQUEST_ACTION = 'dropBreakGlass'

// Mav council actions
export const SIGN_MAVRYK_COUNCIL_ACTION = 'counsilSignAction'
export const ADD_VESTEE_ACTION = 'addVestee'
export const ADD_COUNSIL_MEMBER_ACTION = 'addCounsilMember'
export const UPDATE_VESTEE_ACTION = 'updateVestee'
export const TOGGLE_VESTEE_LOCK_ACTION = 'toggleVesteeLock'
export const CHANGE_COUNCIL_MEMBER_ACTION = 'changeCounsilMember'
export const REMOVE_COUNCIL_MEMBER_ACTION = 'removeCounsilMember'
export const UPDATE_COUNSIL_MEMBER_INFO_ACTION = 'updateCounsilMemberData'
export const TRANSFER_TOKENS_ACTION = 'transferTokens'
export const REQUEST_TOKENS_ACTION = 'requestTokens'
export const REQUEST_TOKENS_MINT_ACTION = 'requestTokenMint'
export const DROP_FIN_REQUEST_ACTION = 'dropFinReq'
export const REMOVE_VESTEE_ACTION = 'removeVestee'
export const SET_BAKER_ACTION = 'setBaker'
export const SET_CONTRACT_BAKER_ACTION = 'setContractBaker'
export const DROP_MAVRYK_COUNCIL_REQUEST_ACTION = 'daropRequest'

// subs
export const BG_COUNCIL_ACTIONS_DATA = 'BG_COUNCIL_ACTIONS_DATA'
export const COUNCIL_ACTIONS_DATA = 'COUNCIL_ACTIONS_DATA'
export const COUNCIL_MEMBERS_SUB = 'COUNCIL_MEMBERS_SUB'
export const BG_COUNCIL_MEMBERS_SUB = 'BG_COUNCIL_MEMBERS_SUB'

// break glass subs
export const MY_BG_PAST_COUNCIL_ACTIONS_SUB = 'myBgPastCouncilActions'
export const ALL_BG_PAST_COUNCIL_ACTIONS_SUB = 'allBgPastCouncilActions'
export const ALL_BG_ONGOING_COUNCIL_ACTIONS_SUB = 'allBgOngoingCouncilActions'

// mavryk council subs
export const MY_PAST_COUNCIL_ACTIONS_SUB = 'myPastCouncilActions'
export const ALL_PAST_COUNCIL_ACTIONS_SUB = 'allPastCouncilActions'
export const ALL_ONGOING_COUNCIL_ACTIONS_SUB = 'allOngoingCouncilActions'

// PROVIDER DEFAULT SUBS CONSTS
export const DEFAULT_COUNCIL_ACTIVE_SUBS: CouncilSubsRecordType = {
  [BG_COUNCIL_ACTIONS_DATA]: null,
  [COUNCIL_ACTIONS_DATA]: null,
  [COUNCIL_MEMBERS_SUB]: false,
  [BG_COUNCIL_MEMBERS_SUB]: false,
} as const

// PROVIDER DEFAULT DATA CONSTS
const NULLABLE_COUNCIL_ACTIONS_DATA: NullableCouncilActionsRecordType = {
  allPendingActions: null,
  myPendingActions: null,
  notMyPendingActions: null,
  allPastActions: null,
  myPastActions: null,
  actionsMapper: null,
}

const EMPTY_COUNCIL_ACTIONS_DATA: CouncilActionsRecordType = {
  allPendingActions: [],
  myPendingActions: [],
  notMyPendingActions: [],
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
