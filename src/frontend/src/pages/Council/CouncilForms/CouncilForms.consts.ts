import { CouncilsFormsIds } from 'providers/CouncilProvider/helpers/council.types'
import { MavrykCounsilDdForms, BgCounsilDdForms, UPDATE_USER_COUNCIL_PROFILE_FORM } from '../helpers/council.consts'

// grid setting for council forms
export const CouncilFormsGridMapper: Record<
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
    rowsTemplate: `auto 50px`,
    areaTemplate: `
      "admin-address select-contracts"
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
