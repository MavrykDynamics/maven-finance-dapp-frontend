import { MavrykCounsilDdForms, BgCounsilDdForms } from 'pages/Council/helpers/council.consts'
import { COUNCIL_ACTIONS_PARAMS_MAPPER } from 'providers/CouncilProvider/helpers/council.consts'
import { CouncilActionParamsNames, CouncilsActionsIds } from 'providers/CouncilProvider/helpers/council.types'

export type CouncilActionsToSignColumnsType = Record<
  CouncilsActionsIds,
  Partial<
    Record<
      CouncilActionParamsNames,
      {
        className: string
        cellName: string
        type: 'number' | 'address' | 'image' | 'url' | 'default'
        sufix?: string
      }
    >
  >
>

// mapper for showing only allowed cells on sign action card
// TODO: fill other cards when data for testing will be avaliable
export const CouncilActionsToSignGridCellsMapper: CouncilActionsToSignColumnsType = {
  // ------- MAVRYK COUNCIL MEMBERS FORMS
  [MavrykCounsilDdForms.ADD_COUNCIL_MEMBER]: {
    [COUNCIL_ACTIONS_PARAMS_MAPPER.councilMemberAddress]: {
      className: 'member-address',
      type: 'address',
      cellName: 'Council Member Address',
    },
    [COUNCIL_ACTIONS_PARAMS_MAPPER.councilMemberName]: {
      className: 'member-name',
      type: 'default',
      cellName: 'Council Member Name',
    },
    [COUNCIL_ACTIONS_PARAMS_MAPPER.councilMemberWebsite]: {
      className: 'member-url',
      type: 'url',
      cellName: 'Council Member Website',
    },
    [COUNCIL_ACTIONS_PARAMS_MAPPER.councilMemberImage]: {
      className: 'member-image',
      type: 'image',
      cellName: 'Council Member Image',
    },
  },
  [MavrykCounsilDdForms.CHANGE_COUNCIL_MEMBER]: {},
  [MavrykCounsilDdForms.REMOVE_COUNCIL_MEMBER]: {
    [COUNCIL_ACTIONS_PARAMS_MAPPER.councilMemberAddress]: {
      className: 'member-address',
      type: 'address',
      cellName: 'Council Member Address',
    },
  },

  // ------- MAVRYK COUNCIL VESTEES FORMS
  [MavrykCounsilDdForms.ADD_VESTEE]: {
    [COUNCIL_ACTIONS_PARAMS_MAPPER.vesteeAddress]: {
      className: 'vestee-address',
      type: 'address',
      cellName: 'Vestee Address',
    },
    [COUNCIL_ACTIONS_PARAMS_MAPPER.cliffInMonths]: {
      className: 'vestee-cliff-period',
      type: 'number',
      sufix: 'month',
      cellName: 'Cliff Period',
    },
    [COUNCIL_ACTIONS_PARAMS_MAPPER.vestingInMonths]: {
      className: 'vesting-period',
      type: 'number',
      sufix: 'month',
      cellName: 'Vesting Period',
    },
    [COUNCIL_ACTIONS_PARAMS_MAPPER.totalAllocatedAmount]: {
      className: 'vestee-allocated-amount',
      type: 'number',
      sufix: 'MVK',
      cellName: 'Total Allocated Amount',
    },
  },
  [MavrykCounsilDdForms.UPDATE_VESTEE]: {},
  [MavrykCounsilDdForms.TOGGLE_VESTEE_LOCK]: {},
  [MavrykCounsilDdForms.REMOVE_VESTEE]: {
    vesteeAddress: { className: 'vestee-address', type: 'address', cellName: 'Vestee Address' },
  },

  // ------- MAVRYK COUNCIL TOKENS FORMS
  [MavrykCounsilDdForms.REQUEST_TOKENS]: {},
  [MavrykCounsilDdForms.REQUEST_TOKEN_MINT]: {
    treasuryAddress: { className: 'treasury-address', type: 'address', cellName: 'Treasury Address' },
    tokenAmount: { className: 'token-amount', type: 'number', sufix: 'MVK', cellName: 'Token Amount' },
    purpose: { className: 'purpose', type: 'default', cellName: 'Purpose for Request' },
  },
  [MavrykCounsilDdForms.TRANSFER_TOKENS]: {},

  // ------- MAVRYK COUNCIL BAKERS FORMS
  [MavrykCounsilDdForms.SET_BAKER]: {},
  [MavrykCounsilDdForms.SET_CONTRACT_BAKER]: {},

  // ------- MAVRYK COUNCIL OTHER FORMS
  [MavrykCounsilDdForms.DROP_FINANCIAL_REQUEST]: {},

  // ------- BREAG GLASS COUNCIL MEMBERS FORMS
  [BgCounsilDdForms.BG_ADD_COUNCIL_MEMBER]: {
    [COUNCIL_ACTIONS_PARAMS_MAPPER.councilMemberAddress]: {
      className: 'member-address',
      type: 'address',
      cellName: 'Council Member Address',
    },
    [COUNCIL_ACTIONS_PARAMS_MAPPER.councilMemberName]: {
      className: 'member-name',
      type: 'default',
      cellName: 'Council Member Name',
    },
    [COUNCIL_ACTIONS_PARAMS_MAPPER.councilMemberWebsite]: {
      className: 'member-url',
      type: 'url',
      cellName: 'Council Member Website',
    },
    [COUNCIL_ACTIONS_PARAMS_MAPPER.councilMemberImage]: {
      className: 'member-image',
      type: 'image',
      cellName: 'Council Member Image',
    },
  },
  [BgCounsilDdForms.BG_CHANGE_COUNCIL_MEMBER]: {},
  [BgCounsilDdForms.BG_REMOVE_COUNCIL_MEMBER]: {
    [COUNCIL_ACTIONS_PARAMS_MAPPER.councilMemberAddress]: {
      className: 'member-address',
      type: 'address',
      cellName: 'Council Member Address',
    },
  },

  // ------- BREAG GLASS COUNCIL CONTRACTS ADMIN FORMS
  [BgCounsilDdForms.SET_ALL_CONTRACTS_ADMIN]: {},
  [BgCounsilDdForms.SET_SELECTED_CONTRACTS_ADMIN]: {},

  // ------- BREAG GLASS COUNCIL CONTRACTS OTHER FORMS
  [BgCounsilDdForms.REMOVE_BREAK_GLASS_CONTROLL]: {},
  [BgCounsilDdForms.SIGN_ACTION]: {},
  [BgCounsilDdForms.UNPAUSE_ALL_ENTRYPOINTS]: {},
}

// grid setting for council sign cards
// TODO: fill other cards when data for testing will be avaliable
export const CouncilActionsToSignGridSettingsMapper: Record<
  CouncilsActionsIds,
  {
    columnsTemplate: string
    rowsTemplate: string
    areaTemplate: string
  }
> = {
  // ------- MAVRYK COUNCIL MEMBERS FORMS
  [MavrykCounsilDdForms.ADD_COUNCIL_MEMBER]: {
    // ready
    columnsTemplate: `auto auto 180px`,
    rowsTemplate: `1fr 1fr`,
    areaTemplate: `
      "member-address member-name signed-amount"
      "member-image member-url sign-btn"
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
    columnsTemplate: `auto auto`, // ready
    rowsTemplate: `1fr 1fr`,
    areaTemplate: `
      "member-address signed-amount"
      "sign-btn sign-btn"
    `,
  },

  // ------- MAVRYK COUNCIL VESTEES FORMS
  [MavrykCounsilDdForms.ADD_VESTEE]: {
    // ready
    columnsTemplate: `auto auto 180px`,
    rowsTemplate: `1fr 1fr`,
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
    // ready
    columnsTemplate: `auto auto`,
    rowsTemplate: `1fr 1fr`,
    areaTemplate: `
      "vestee-address signed-amount"
      "sign-btn sign-btn"
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
    // ready
    columnsTemplate: `auto auto 180px`,
    rowsTemplate: `1fr 1fr`,
    areaTemplate: `
      "treasury-address token-amount signed-amount"
      "purpose . sign-btn"
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
}
