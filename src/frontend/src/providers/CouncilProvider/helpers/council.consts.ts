import {
  CouncilActionsRecordType,
  CouncilStateType,
  CouncilSubsRecordType,
  NullableCouncilActionsRecordType,
  NullableCouncilContextStateType,
} from '../council.provider.types'

// BG council actions
export const SET_SELECTED_CONTRACTS_ADMIN_ACTION = 'setContractsAdminAction'
export const REMOVE_BG_CONTROLL_ACTION = 'removeBreakGlassControl'
export const UNPAUSE_ALL_ENTRYPOINTS_ACTION = 'unpauseAllEntrypointsAction'
export const SIGN_BREAK_GLASS_COUNCIL_ACTION = 'signBgActionAction'
export const ADD_BREAK_GLASS_COUNCIL_MEMBER_ACTION = 'addBgCouncilMemberAction'
export const UPDATE_BREAK_GLASS_COUNCIL_MEMBER_ACTION = 'updateBgCouncilMemberAction'
export const CHANGE_BREAK_GLASS_COUNCIL_MEMBER_ACTION = 'changeBgCouncilMemberAction'
export const REMOVE_BREAK_GLASS_COUNCIL_MEMBER_ACTION = 'removeBgCouncilMemberAction'
export const PROPAGATE_BREAK_GLASS_ACTION = 'propagateBreakGlassAction'
export const DROP_BREAK_GLASS_COUNCIL_REQUEST_ACTION = 'dropBreakGlassCouncilAction'

// Mav council actions
export const SIGN_MAVRYK_COUNCIL_ACTION = 'councilSignActionAction'
export const ADD_VESTEE_ACTION = 'addVesteeAction'
export const ADD_COUNSIL_MEMBER_ACTION = 'addCouncilMemberAction'
export const UPDATE_VESTEE_ACTION = 'updateVesteeAction'
export const TOGGLE_VESTEE_LOCK_ACTION = 'toggleVesteeLockAction'
export const CHANGE_COUNCIL_MEMBER_ACTION = 'changeCouncilMemberAction'
export const REMOVE_COUNCIL_MEMBER_ACTION = 'removeCouncilMemberAction'
export const UPDATE_COUNSIL_MEMBER_INFO_ACTION = 'updateCouncilMemberAction'
export const TRANSFER_TOKENS_ACTION = 'transferTokensAction'
export const REQUEST_TOKENS_ACTION = 'requestTokensAction'
export const REQUEST_TOKENS_MINT_ACTION = 'requestTokenMintAction'
export const DROP_FIN_REQUEST_ACTION = 'dropFinancialRequestAction'
export const REMOVE_VESTEE_ACTION = 'removeVesteeAction'
export const SET_BAKER_ACTION = 'setBakerAction'
export const SET_CONTRACT_BAKER_ACTION = 'setContractBakerAction'
export const DROP_MAVRYK_COUNCIL_REQUEST_ACTION = 'dropMavrykCouncilActionAction'

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
  actionsToSign: null,
  allPastActions: null,
  myPastActions: null,
  actionsMapper: null,
}

const EMPTY_COUNCIL_ACTIONS_DATA: CouncilActionsRecordType = {
  allPendingActions: [],
  myPendingActions: [],
  actionsToSign: [],
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

// action params names
export const COUNCIL_ACTIONS_PARAMS_MAPPER = {
  councilMemberAddress: 'councilMemberAddress',
  newCouncilMemberAddress: 'newCouncilMemberAddress',
  oldCouncilMemberAddress: 'oldCouncilMemberAddress',
  newAdminAddress: 'newAdminAddress',
  newCouncilMemberName: 'newCouncilMemberName',
  councilMemberName: 'councilMemberName',
  newCouncilMemberWebsite: 'newCouncilMemberWebsite',
  councilMemberWebsite: 'councilMemberWebsite',
  newCouncilMemberImage: 'newCouncilMemberImage',
  councilMemberImage: 'councilMemberImage',
  vesteeAddress: 'vesteeAddress',
  cliffInMonths: 'cliffInMonths',
  newCliffInMonths: 'newCliffInMonths',
  vestingInMonths: 'vestingInMonths',
  newVestingInMonths: 'newVestingInMonths',
  totalAllocatedAmount: 'totalAllocatedAmount',
  newTotalAllocatedAmount: 'newTotalAllocatedAmount',
  receiverAddress: 'receiverAddress',
  treasuryAddress: 'treasuryAddress',
  tokenAmount: 'tokenAmount',
  tokenContractAddress: 'tokenContractAddress',
  tokenType: 'tokenType',
  tokenName: 'tokenName',
  tokenId: 'tokenId',
  purpose: 'purpose',
  keyHash: 'keyHash',
  requestId: 'requestId',
  targetContractAddress: 'targetContractAddress',
  contractAddressSet: 'contractAddressSet',
} as const
