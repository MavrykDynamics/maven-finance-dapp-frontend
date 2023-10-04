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
  ADD_COUNCIL_MEMBER: 'ADD_COUNCIL_MEMBER',
  UPDATE_VESTEE: 'UPDATE_VESTEE',
  TOGGLE_VESTEE_LOCK: 'TOGGLE_VESTEE_LOCK',
  REMOVE_VESTEE: 'REMOVE_VESTEE',
  CHANGE_COUNCIL_MEMBER: 'CHANGE_COUNCIL_MEMBER',
  REMOVE_COUNCIL_MEMBER: 'REMOVE_COUNCIL_MEMBER',
  TRANSFER_TOKENS: 'TRANSFER_TOKENS',
  REQUEST_TOKENS: 'REQUEST_TOKENS',
  REQUEST_TOKEN_MINT: 'REQUEST_TOKEN_MINT',
  DROP_FINANCIAL_REQUEST: 'DROP_FINANCIAL_REQUEST',
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
  SET_ALL_CONTRACTS_ADMIN: 'SET_ALL_CONTRACTS_ADMIN',
  SET_SELECTED_CONTRACTS_ADMIN: 'SET_SELECTED_CONTRACTS_ADMIN',
  UNPAUSE_ALL_ENTRYPOINTS: 'UNPAUSE_ALL_ENTRYPOINTS',
  REMOVE_BREAK_GLASS_CONTROLL: 'REMOVE_BREAK_GLASS_CONTROLL',
  SIGN_ACTION: 'SIGN_ACTION',
  ADD_COUNCIL_MEMBER: 'BG_ADD_COUNCIL_MEMBER',
  CHANGE_COUNCIL_MEMBER: 'BG_CHANGE_COUNCIL_MEMBER',
  REMOVE_COUNCIL_MEMBER: 'BG_REMOVE_COUNCIL_MEMBER',
} as const

export const UPDATE_COUNCIL_MEMBER = 'UPDATE_COUNCIL_MEMBER'

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

export type CouncilsFormsNames =
  | (typeof MavrykCounsilDdForms)[keyof typeof MavrykCounsilDdForms]
  | (typeof BgCounsilDdForms)[keyof typeof BgCounsilDdForms]
  | typeof UPDATE_COUNCIL_MEMBER

export const CouncilFormsGridMapper: Record<
  CouncilsFormsNames,
  {
    columnsTemplate: string
    rowsTemplate: string
    areaTemplate: string
  }
> = {
  // ------- MAVRYK COUNCIL FORMS
  [MavrykCounsilDdForms.ADD_COUNCIL_MEMBER]: {
    columnsTemplate: ``,
    rowsTemplate: ``,
    areaTemplate: ``,
  },
  [MavrykCounsilDdForms.ADD_VESTEE]: {
    columnsTemplate: ``,
    rowsTemplate: ``,
    areaTemplate: ``,
  },
  [MavrykCounsilDdForms.CHANGE_COUNCIL_MEMBER]: {
    columnsTemplate: ``,
    rowsTemplate: ``,
    areaTemplate: ``,
  },
  [MavrykCounsilDdForms.DROP_FINANCIAL_REQUEST]: {
    columnsTemplate: ``,
    rowsTemplate: ``,
    areaTemplate: ``,
  },
  [MavrykCounsilDdForms.REMOVE_COUNCIL_MEMBER]: {
    columnsTemplate: ``,
    rowsTemplate: ``,
    areaTemplate: ``,
  },
  [MavrykCounsilDdForms.REMOVE_VESTEE]: {
    columnsTemplate: ``,
    rowsTemplate: ``,
    areaTemplate: ``,
  },
  [MavrykCounsilDdForms.REQUEST_TOKENS]: {
    columnsTemplate: ``,
    rowsTemplate: ``,
    areaTemplate: ``,
  },
  [MavrykCounsilDdForms.REQUEST_TOKEN_MINT]: {
    columnsTemplate: ``,
    rowsTemplate: ``,
    areaTemplate: ``,
  },
  [MavrykCounsilDdForms.SET_BAKER]: {
    columnsTemplate: ``,
    rowsTemplate: ``,
    areaTemplate: ``,
  },
  [MavrykCounsilDdForms.TOGGLE_VESTEE_LOCK]: {
    columnsTemplate: ``,
    rowsTemplate: ``,
    areaTemplate: ``,
  },
  [MavrykCounsilDdForms.TRANSFER_TOKENS]: {
    columnsTemplate: ``,
    rowsTemplate: ``,
    areaTemplate: ``,
  },
  [MavrykCounsilDdForms.UPDATE_VESTEE]: {
    columnsTemplate: ``,
    rowsTemplate: ``,
    areaTemplate: ``,
  },
  [MavrykCounsilDdForms.SET_CONTRACT_BAKER]: {
    columnsTemplate: ``,
    rowsTemplate: '',
    areaTemplate: '',
  },
  // ------- BREAG GLASS COUNCIL FORMS
  [BgCounsilDdForms.ADD_COUNCIL_MEMBER]: {
    columnsTemplate: `1fr 1fr`,
    rowsTemplate: `auto auto auto 50px`,
    areaTemplate: `
      "member-address member-name"
      "member-url member-url"
      "member-image member-image"
      ". submit-form"
    `,
  },
  [BgCounsilDdForms.CHANGE_COUNCIL_MEMBER]: {
    columnsTemplate: `1fr 1fr`,
    rowsTemplate: `auto auto auto auto 50px`,
    areaTemplate: `
      "select-council-member ."
      "member-address member-name"
      "member-url ."
      "member-image member-image"
      ". submit-form"
    `,
  },
  [BgCounsilDdForms.REMOVE_BREAK_GLASS_CONTROLL]: {
    columnsTemplate: ``,
    rowsTemplate: ``,
    areaTemplate: ``,
  },
  [BgCounsilDdForms.REMOVE_COUNCIL_MEMBER]: {
    columnsTemplate: `380px auto`,
    rowsTemplate: `auto`,
    areaTemplate: `
      "select-council-member submit-form"
    `,
  },
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
  [BgCounsilDdForms.SIGN_ACTION]: {
    columnsTemplate: `380px auto`,
    rowsTemplate: `auto`,
    areaTemplate: `
      "action-id submit-form"
    `,
  },
  [BgCounsilDdForms.UNPAUSE_ALL_ENTRYPOINTS]: {
    columnsTemplate: ``,
    rowsTemplate: ``,
    areaTemplate: ``,
  },
  // ------- COMMON COUNCIL FORMS
  [UPDATE_COUNCIL_MEMBER]: {
    columnsTemplate: `1fr 1fr`,
    rowsTemplate: `auto auto auto 50px`,
    areaTemplate: `
      "member-address member-name"
      "member-url ."
      "member-image member-image"
      ". submit-form"
    `,
  },
}
