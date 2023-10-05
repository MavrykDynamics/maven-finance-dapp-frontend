import { SlidingTabButtonType } from 'app/App.components/SlidingTabButtons/SlidingTabButtons.controller'

// mavryk council consts
export const MavrykCounsilPageTitles = {
  membersName: 'Council Members',
  cardIdName: 'Council action ID',
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
  cardIdName: 'Break Glass Action ID',
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

export const UPDATE_USER_COUNCIL_PROFILE_FORM = 'UPDATE_USER_COUNCIL_PROFILE_FORM'

// common consts for councils
export const MY_PENDING_COUNSIL_TAB = ''
export const MY_PAST_COUNSIL_TAB = 'my-past-actions'
export const ALL_PENDING_COUNSIL_TAB = 'pending-actions'
export const ALL_PAST_COUNSIL_TAB = 'past-actions'

export const councilTabsList: SlidingTabButtonType[] = [
  {
    text: 'My Ongoing Actions',
    id: 1,
    active: true,
  },
  {
    text: 'My Past Actions',
    id: 2,
    active: false,
  },
]

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

export type CouncilsFormsNames =
  | (typeof MavrykCounsilDdForms)[keyof typeof MavrykCounsilDdForms]
  | (typeof BgCounsilDdForms)[keyof typeof BgCounsilDdForms]
  | typeof UPDATE_USER_COUNCIL_PROFILE_FORM

export const CouncilFormsGridMapper: Record<
  CouncilsFormsNames,
  {
    columnsTemplate: string
    rowsTemplate: string
    areaTemplate: string
  }
> = {
  // ------- MAVRYK COUNCIL MEMBERS FORMS
  [MavrykCounsilDdForms.ADD_COUNCIL_MEMBER]: {
    columnsTemplate: `1fr 1fr`,
    rowsTemplate: `auto auto auto 50px`,
    areaTemplate: `
      "member-address member-name"
      "member-url member-url"
      "member-image member-image"
      ". submit-form"
    `,
  },
  [MavrykCounsilDdForms.CHANGE_COUNCIL_MEMBER]: {
    columnsTemplate: `1fr 1fr`,
    rowsTemplate: `auto auto auto auto 50px`,
    areaTemplate: `
      "select-council-member ."
      "member-address member-name"
      "member-url member-url"
      "member-image member-image"
      ". submit-form"
    `,
  },
  [MavrykCounsilDdForms.REMOVE_COUNCIL_MEMBER]: {
    columnsTemplate: `380px auto`,
    rowsTemplate: `auto`,
    areaTemplate: `
      "select-council-member submit-form"
    `,
  },

  // ------- MAVRYK COUNCIL VESTEES FORMS
  [MavrykCounsilDdForms.ADD_VESTEE]: {
    columnsTemplate: `1fr 1fr`,
    rowsTemplate: `auto auto 50px`,
    areaTemplate: `
      "vestee-address vestee-allocated-amount"
      "vestee-cliff-period vesting-period"
      ". submit-form"
    `,
  },
  [MavrykCounsilDdForms.UPDATE_VESTEE]: {
    columnsTemplate: `1fr 1fr`,
    rowsTemplate: `auto auto 50px`,
    areaTemplate: `
      "vestee-address vestee-allocated-amount"
      "vestee-cliff-period vesting-period"
      ". submit-form"
    `,
  },
  [MavrykCounsilDdForms.TOGGLE_VESTEE_LOCK]: {
    columnsTemplate: `380px auto`,
    rowsTemplate: `auto`,
    areaTemplate: `
      "vestee-address submit-form"
    `,
  },
  [MavrykCounsilDdForms.REMOVE_VESTEE]: {
    columnsTemplate: `380px auto`,
    rowsTemplate: `auto`,
    areaTemplate: `
      "vestee-address submit-form"
    `,
  },

  // ------- MAVRYK COUNCIL TOKENS FORMS
  [MavrykCounsilDdForms.REQUEST_TOKENS]: {
    columnsTemplate: `1fr 1fr`,
    rowsTemplate: `auto auto auto auto 60px`,
    areaTemplate: `
      "admin-address ."
      "contract-address token-name"
      "token-amount token-type"
      "purpose purpose"
      ". submit-form"
    `,
  },
  [MavrykCounsilDdForms.REQUEST_TOKEN_MINT]: {
    columnsTemplate: `1fr 1fr`,
    rowsTemplate: `auto auto 60px`,
    areaTemplate: `
      "contract-address token-amount"
      "purpose purpose"
      ". submit-form"
    `,
  },
  [MavrykCounsilDdForms.TRANSFER_TOKENS]: {
    columnsTemplate: `1fr 1fr`,
    rowsTemplate: `auto auto auto auto 60px`,
    areaTemplate: `
      "receiver-address ."
      "contract-address token-amount"
      "token-type token-name"
      "purpose purpose"
      ". submit-form"
    `,
  },

  // ------- MAVRYK COUNCIL BAKERS FORMS
  [MavrykCounsilDdForms.SET_BAKER]: {
    columnsTemplate: `380px auto`,
    rowsTemplate: `auto`,
    areaTemplate: `
      "baker-hash submit-form"
    `,
  },
  [MavrykCounsilDdForms.SET_CONTRACT_BAKER]: {
    columnsTemplate: `1fr 1fr`,
    rowsTemplate: `auto 50px`,
    areaTemplate: `
      "contract-address baker-hash"
      ". submit-form"
    `,
  },

  // ------- MAVRYK COUNCIL OTHER FORMS
  [MavrykCounsilDdForms.DROP_FINANCIAL_REQUEST]: {
    columnsTemplate: `380px auto`,
    rowsTemplate: `auto`,
    areaTemplate: `
      "select-contracts submit-form"
    `,
  },

  // ------- BREAG GLASS COUNCIL MEMBERS FORMS
  [BgCounsilDdForms.BG_ADD_COUNCIL_MEMBER]: {
    columnsTemplate: `1fr 1fr`,
    rowsTemplate: `auto auto auto 50px`,
    areaTemplate: `
      "member-address member-name"
      "member-url member-url"
      "member-image member-image"
      ". submit-form"
    `,
  },
  [BgCounsilDdForms.BG_CHANGE_COUNCIL_MEMBER]: {
    columnsTemplate: `1fr 1fr`,
    rowsTemplate: `auto auto auto auto 50px`,
    areaTemplate: `
      "select-council-member ."
      "member-address member-name"
      "member-url member-url"
      "member-image member-image"
      ". submit-form"
    `,
  },
  [BgCounsilDdForms.BG_REMOVE_COUNCIL_MEMBER]: {
    columnsTemplate: `380px auto`,
    rowsTemplate: `auto`,
    areaTemplate: `
      "select-council-member submit-form"
    `,
  },

  // ------- BREAG GLASS COUNCIL CONTRACTS ADMIN FORMS
  [BgCounsilDdForms.SET_ALL_CONTRACTS_ADMIN]: {
    columnsTemplate: `380px auto`,
    rowsTemplate: `auto`,
    areaTemplate: `
      "admin-address submit-form"
    `,
  },
  [BgCounsilDdForms.SET_SELECTED_CONTRACTS_ADMIN]: {
    columnsTemplate: `1fr 1fr`,
    rowsTemplate: `auto auto 50px`,
    areaTemplate: `
      "admin-address ."
      "select-contracts select-contracts"
      ". submit-form"
    `,
  },

  // ------- BREAG GLASS COUNCIL CONTRACTS OTHER FORMS
  [BgCounsilDdForms.REMOVE_BREAK_GLASS_CONTROLL]: {
    columnsTemplate: `380px auto`,
    rowsTemplate: `auto`,
    areaTemplate: `
      "select-contracts submit-form"
    `,
  },
  [BgCounsilDdForms.SIGN_ACTION]: {
    columnsTemplate: `380px auto`,
    rowsTemplate: `auto`,
    areaTemplate: `
      "action-id submit-form"
    `,
  },
  [BgCounsilDdForms.UNPAUSE_ALL_ENTRYPOINTS]: {
    columnsTemplate: `380px auto`,
    rowsTemplate: `auto`,
    areaTemplate: `
      "select-contracts submit-form"
    `,
  },

  // ------- COMMON BREAG GLASS & MAVRYK COUNCIL FORMS
  [UPDATE_USER_COUNCIL_PROFILE_FORM]: {
    columnsTemplate: `1fr 1fr`,
    rowsTemplate: `auto auto auto 50px`,
    areaTemplate: `
      "member-address member-name"
      "member-url member-url"
      "member-image member-image"
      ". submit-form"
    `,
  },
}
