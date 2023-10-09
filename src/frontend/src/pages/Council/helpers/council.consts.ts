// mavryk council consts
export const MavrykCounsilPageTitles = {
  membersName: 'Council Members',
  allPastActions: 'Past Council Actions',
  allPending: 'Pending Signature Council Actions',
}

export const MavrykCounsilDdForms = {
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
export const BgCounsilPageTitles = {
  membersName: 'Break Glass Council',
  allPastActions: 'Past Break Glass Council Actions',
  allPending: 'Pending Signature Council Actions',
}

export const BgCounsilDdForms = {
  BG_ADD_COUNCIL_MEMBER: 'BG_ADD_COUNCIL_MEMBER',
  BG_CHANGE_COUNCIL_MEMBER: 'BG_CHANGE_COUNCIL_MEMBER',
  BG_REMOVE_COUNCIL_MEMBER: 'BG_REMOVE_COUNCIL_MEMBER',
  SIGN_ACTION: 'SIGN_ACTION',
  UNPAUSE_ALL_ENTRYPOINTS: 'UNPAUSE_ALL_ENTRYPOINTS',
  SET_SELECTED_CONTRACTS_ADMIN: 'SET_SELECTED_CONTRACTS_ADMIN',
  REMOVE_BREAK_GLASS_CONTROLL: 'REMOVE_BREAK_GLASS_CONTROLL',
  SET_ALL_CONTRACTS_ADMIN: 'SET_ALL_CONTRACTS_ADMIN',
} as const

// common consts for councils
export const MY_PENDING_COUNSIL_TAB = ''
export const MY_PAST_COUNSIL_TAB = 'my-past-actions'
export const ALL_PENDING_COUNSIL_TAB = 'pending-actions'
export const ALL_PAST_COUNSIL_TAB = 'past-actions'

export const UPDATE_USER_COUNCIL_PROFILE_FORM = 'UPDATE_USER_COUNCIL_PROFILE_FORM'

// mapper for forms names in dd
export const COUNCIL_FORMS_NAMES_MAPPER = {
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
  SET_ALL_CONTRACTS_ADMIN: 'Set All Contracts Admin',
  SET_SELECTED_CONTRACTS_ADMIN: 'Set Selected Contracts Admin',
  UNPAUSE_ALL_ENTRYPOINTS: 'Unpause All Entrypoints',
  REMOVE_BREAK_GLASS_CONTROLL: 'Remove Break Glass Controll',
  SIGN_ACTION: 'Sign Action',
  BG_ADD_COUNCIL_MEMBER: 'Add Council Member',
  BG_CHANGE_COUNCIL_MEMBER: 'Change Council Member',
  BG_REMOVE_COUNCIL_MEMBER: 'Remove Council Member',
}
