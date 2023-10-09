import {
  MavrykCounsilDdForms,
  BgCounsilDdForms,
  UPDATE_USER_COUNCIL_PROFILE_FORM,
} from 'pages/Council/helpers/council.consts'
import { CouncilsFormsIds } from 'providers/CouncilProvider/helpers/council.types'

export type CouncilActionsToSignColumnsType = Record<
  string,
  {
    className: string
    sufix?: string
    type: 'number' | 'address' | 'image' | 'url' | 'default'
  }
>
// mapper for action params fields, only those are outputted on client only
// used to check whether client show field for user and getting grid-area classname
export const COUNCIL_ACTIONS_TO_SIGN_COLUMS_MAPPER: CouncilActionsToSignColumnsType = {
  // addresses
  councilMemberAddress: { className: 'member-address', type: 'address' },
  newCouncilMemberAddress: { className: 'member-address', type: 'address' },
  oldCouncilMemberAddress: { className: 'old-member-address', type: 'address' },
  newAdminAddress: { className: 'admin-address', type: 'address' },

  // names
  newCouncilMemberName: { className: 'member-name', type: 'default' },
  councilMemberName: { className: 'member-name', type: 'default' },

  // websites
  newCouncilMemberWebsite: { className: 'member-url', type: 'url' },
  councilMemberWebsite: { className: 'member-url', type: 'url' },

  // images
  newCouncilMemberImage: { className: 'member-image', type: 'image' },
  councilMemberImage: { className: 'member-image', type: 'image' },

  // vesting
  vesteeAddress: { className: 'vestee-address', type: 'address' },
  cliffInMonths: { className: 'vestee-cliff-period', type: 'number', sufix: 'month' },
  newCliffInMonths: { className: 'vestee-cliff-period', type: 'number', sufix: 'month' },
  vestingInMonths: { className: 'vesting-period', type: 'number', sufix: 'month' },
  newVestingInMonths: { className: 'vesting-period', type: 'number', sufix: 'month' },
  totalAllocatedAmount: { className: 'vestee-allocated-amount', type: 'number', sufix: 'MVK' },
  newTotalAllocatedAmount: { className: 'vestee-allocated-amount', type: 'number', sufix: 'MVK' },

  // tokens requests
  receiverAddress: { className: 'receiver-address', type: 'address' },
  treasuryAddress: { className: 'treasury-address', type: 'address' },
  tokenAmount: { className: 'token-amount', type: 'number' },
  tokenContractAddress: { className: 'token-address', type: 'address' },
  tokenType: { className: 'token-type', type: 'default' },
  tokenId: { className: 'token-id', type: 'default' },

  // other
  purpose: { className: 'purpose', type: 'default' },
  keyHash: { className: 'key-hash', type: 'address' },
  targetContractAddress: { className: 'target-contract-addresses', type: 'address' },
}

// grid setting for council sign cards
export const CouncilActionsToSignGridMapper: Record<
  CouncilsFormsIds,
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
    columnsTemplate: `auto auto 180px`, // ready
    rowsTemplate: `auto 50px`,
    areaTemplate: `
      "vestee-address vestee-allocated-amount signed-amount"
      "vestee-cliff-period vesting-period sign-btn"
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
