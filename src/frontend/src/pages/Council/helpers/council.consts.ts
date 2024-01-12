import {CouncilsActionsIds} from 'providers/CouncilProvider/helpers/council.types' // maven council consts

// maven council consts
export const MavenCouncilPageTitles = {
  membersName: 'Council Members',
  allPastActions: 'Past Council Actions',
  allPending: 'Pending Signature Council Actions',
}

export const MavenCouncilDdForms = {
  ADD_VESTEE: 'ADD_VESTEE',
  UPDATE_VESTEE: 'UPDATE_VESTEE',
  REMOVE_VESTEE: 'REMOVE_VESTEE',
  ADD_COUNCIL_MEMBER: 'ADD_COUNCIL_MEMBER',
  CHANGE_COUNCIL_MEMBER: 'CHANGE_COUNCIL_MEMBER',
  REMOVE_COUNCIL_MEMBER: 'REMOVE_COUNCIL_MEMBER',
  TRANSFER_TOKENS: 'TRANSFER_TOKENS',
  REQUEST_TOKENS: 'REQUEST_TOKENS',
  REQUEST_TOKEN_MINT: 'REQUEST_TOKEN_MINT',
  DROP_FINANCIAL_REQUEST: 'DROP_FINANCIAL_REQUEST',
  TOGGLE_VESTEE_LOCK: 'TOGGLE_VESTEE_LOCK',
  SET_BAKER: 'SET_BAKER',
  SET_CONTRACT_BAKER: 'SET_CONTRACT_BAKER',
} as const

// break glass council consts
export const BgCouncilPageTitles = {
  membersName: 'Break Glass Council',
  allPastActions: 'Past Break Glass Council Actions',
  allPending: 'Pending Signature Council Actions',
} as const

export const BgCouncilDdForms = {
  BG_ADD_COUNCIL_MEMBER: 'BG_ADD_COUNCIL_MEMBER',
  BG_CHANGE_COUNCIL_MEMBER: 'BG_CHANGE_COUNCIL_MEMBER',
  BG_REMOVE_COUNCIL_MEMBER: 'BG_REMOVE_COUNCIL_MEMBER',
  UNPAUSE_ALL_ENTRYPOINTS: 'UNPAUSE_ALL_ENTRYPOINTS',
  SET_MULTIPLE_CONTRACTS_ADMIN: 'SET_MULTIPLE_CONTRACTS_ADMIN',
  REMOVE_BREAK_GLASS_CONTROL: 'REMOVE_BREAK_GLASS_CONTROL',
} as const

// common consts for councils
export const MY_PENDING_COUNCIL_TAB = '' as const
export const MY_PAST_COUNCIL_TAB = 'my-past-actions' as const
export const ALL_PENDING_COUNCIL_TAB = 'pending-actions' as const
export const ALL_PAST_COUNCIL_TAB = 'past-actions' as const

export const UPDATE_USER_COUNCIL_PROFILE_FORM = 'UPDATE_USER_COUNCIL_PROFILE_FORM' as const
export const PROPAGATE_BREAK_GLASS_ACTION_FORM = 'PROPAGATE_BREAK_GLASS_ACTION_FORM' as const
export const DROP_COUNCIL_ACTION_FORM = 'DROP_COUNCIL_ACTION_FORM' as const

// mapper for forms names in dd
export const COUNCIL_FORMS_NAMES_MAPPER: Record<CouncilsActionsIds, string> = {
  ADD_VESTEE: 'Add Vestee',
  ADD_COUNCIL_MEMBER: 'Add Council Member',
  UPDATE_VESTEE: 'Update Vestee',
  TOGGLE_VESTEE_LOCK: 'Toggle Vestee Lock',
  REMOVE_VESTEE: 'Remove Vestee',
  CHANGE_COUNCIL_MEMBER: 'Change Council Member',
  REMOVE_COUNCIL_MEMBER: 'Remove Council Member',
  TRANSFER_TOKENS: 'Transfer Tokens',
  REQUEST_TOKENS: 'Request Tokens',
  REQUEST_TOKEN_MINT: 'Request Token Mint',
  DROP_FINANCIAL_REQUEST: 'Drop Financial Request',
  SET_BAKER: 'Set Baker',
  SET_CONTRACT_BAKER: 'Set Contract Baker',
  SET_MULTIPLE_CONTRACTS_ADMIN: 'Set Multiple Contracts Admin',
  UNPAUSE_ALL_ENTRYPOINTS: 'Unpause All Entrypoints',
  REMOVE_BREAK_GLASS_CONTROL: 'Remove Break Glass Control',
  BG_ADD_COUNCIL_MEMBER: 'Add Council Member',
  BG_CHANGE_COUNCIL_MEMBER: 'Change Council Member',
  BG_REMOVE_COUNCIL_MEMBER: 'Remove Council Member',
  PROPAGATE_BREAK_GLASS_ACTION_FORM: 'Propagate Break Glass',
  DROP_COUNCIL_ACTION_FORM: 'Drop Council Action',
} as const
