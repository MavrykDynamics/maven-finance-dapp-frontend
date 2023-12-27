import {CouncilsFormsIds} from 'providers/CouncilProvider/helpers/council.types'
import {BgCouncilDdForms, MavenCouncilDdForms, UPDATE_USER_COUNCIL_PROFILE_FORM} from '../helpers/council.consts'

// grid setting for council forms
export const CouncilFormsGridMapper: Record<
  CouncilsFormsIds,
  {
    columnsTemplate: string
    rowsTemplate: string
    areaTemplate: string
  }
> = {
  // ------- MAVEN COUNCIL MEMBERS FORMS
  [MavenCouncilDdForms.ADD_COUNCIL_MEMBER]: {
    columnsTemplate: `1fr 1fr`,
    rowsTemplate: `auto auto auto 50px`,
    areaTemplate: `
      "member-address member-name"
      "member-url member-url"
      "member-image member-image"
      ". submit-form"
    `,
  },
  [MavenCouncilDdForms.CHANGE_COUNCIL_MEMBER]: {
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
  [MavenCouncilDdForms.REMOVE_COUNCIL_MEMBER]: {
    columnsTemplate: `380px auto`,
    rowsTemplate: `auto`,
    areaTemplate: `
      "select-council-member submit-form"
    `,
  },

  // ------- MAVEN COUNCIL VESTEES FORMS
  [MavenCouncilDdForms.ADD_VESTEE]: {
    columnsTemplate: `1fr 1fr`,
    rowsTemplate: `auto auto 50px`,
    areaTemplate: `
      "vestee-address vestee-allocated-amount"
      "vestee-cliff-period vesting-period"
      ". submit-form"
    `,
  },
  [MavenCouncilDdForms.UPDATE_VESTEE]: {
    columnsTemplate: `1fr 1fr`,
    rowsTemplate: `auto auto 50px`,
    areaTemplate: `
      "vestee-address vestee-allocated-amount"
      "vestee-cliff-period vesting-period"
      ". submit-form"
    `,
  },
  [MavenCouncilDdForms.TOGGLE_VESTEE_LOCK]: {
    columnsTemplate: `380px auto`,
    rowsTemplate: `auto`,
    areaTemplate: `
      "vestee-address submit-form"
    `,
  },
  [MavenCouncilDdForms.REMOVE_VESTEE]: {
    columnsTemplate: `380px auto`,
    rowsTemplate: `auto`,
    areaTemplate: `
      "vestee-address submit-form"
    `,
  },

  // ------- MAVEN COUNCIL TOKENS FORMS
  [MavenCouncilDdForms.REQUEST_TOKENS]: {
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
  [MavenCouncilDdForms.REQUEST_TOKEN_MINT]: {
    columnsTemplate: `1fr 1fr`,
    rowsTemplate: `auto auto 60px`,
    areaTemplate: `
      "contract-address token-amount"
      "purpose purpose"
      ". submit-form"
    `,
  },
  [MavenCouncilDdForms.TRANSFER_TOKENS]: {
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

  // ------- MAVEN COUNCIL BAKERS FORMS
  [MavenCouncilDdForms.SET_BAKER]: {
    columnsTemplate: `380px auto`,
    rowsTemplate: `auto`,
    areaTemplate: `
      "baker-hash submit-form"
    `,
  },
  [MavenCouncilDdForms.SET_CONTRACT_BAKER]: {
    columnsTemplate: `1fr 1fr`,
    rowsTemplate: `auto 50px`,
    areaTemplate: `
      "contract-address baker-hash"
      ". submit-form"
    `,
  },

  // ------- MAVEN COUNCIL OTHER FORMS
  [MavenCouncilDdForms.DROP_FINANCIAL_REQUEST]: {
    columnsTemplate: `380px auto`,
    rowsTemplate: `auto`,
    areaTemplate: `
      "select-contracts submit-form"
    `,
  },

  // ------- BREAG GLASS COUNCIL MEMBERS FORMS
  [BgCouncilDdForms.BG_ADD_COUNCIL_MEMBER]: {
    columnsTemplate: `1fr 1fr`,
    rowsTemplate: `auto auto auto 50px`,
    areaTemplate: `
      "member-address member-name"
      "member-url member-url"
      "member-image member-image"
      ". submit-form"
    `,
  },
  [BgCouncilDdForms.BG_CHANGE_COUNCIL_MEMBER]: {
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
  [BgCouncilDdForms.BG_REMOVE_COUNCIL_MEMBER]: {
    columnsTemplate: `380px auto`,
    rowsTemplate: `auto`,
    areaTemplate: `
      "select-council-member submit-form"
    `,
  },

  // ------- BREAG GLASS COUNCIL CONTRACTS ADMIN FORM
  [BgCouncilDdForms.SET_MULTIPLE_CONTRACTS_ADMIN]: {
    columnsTemplate: `1fr 1fr`,
    rowsTemplate: `auto 50px`,
    areaTemplate: `
      "admin-address submit-form"
      "select-contracts submit-form"
    `,
  },

  // ------- BREAG GLASS COUNCIL CONTRACTS OTHER FORMS
  [BgCouncilDdForms.REMOVE_BREAK_GLASS_CONTROL]: {
    columnsTemplate: `380px auto`,
    rowsTemplate: `auto`,
    areaTemplate: `
      "select-contracts submit-form"
    `,
  },
  [BgCouncilDdForms.UNPAUSE_ALL_ENTRYPOINTS]: {
    columnsTemplate: `380px auto`,
    rowsTemplate: `auto`,
    areaTemplate: `
      "select-contracts submit-form"
    `,
  },

  // ------- COMMON BREAK GLASS & MAVEN COUNCIL FORMS
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
