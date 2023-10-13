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
// TODO: fill other cards when data for testing will be avaliable, clarify new texts with Sam
export const CouncilActionsToSignGridCellsMapper: CouncilActionsToSignColumnsType = {
  // MAVRYK COUNCIL MEMBERS FORMS
  // ------------------------------------------------------------------------------------
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
  [MavrykCounsilDdForms.CHANGE_COUNCIL_MEMBER]: {
    [COUNCIL_ACTIONS_PARAMS_MAPPER.oldCouncilMemberAddress]: {
      className: 'old-member-address',
      type: 'address',
      // cellName: 'Council Member To Change',
      cellName: 'Member To Change',
    },
    [COUNCIL_ACTIONS_PARAMS_MAPPER.newCouncilMemberAddress]: {
      className: 'member-address',
      type: 'address',
      // cellName: 'Council Member Address',
      cellName: 'New Member Address',
    },
    [COUNCIL_ACTIONS_PARAMS_MAPPER.newCouncilMemberName]: {
      className: 'member-name',
      type: 'default',
      // cellName: 'Council Member Name',
      cellName: 'Member Name',
    },
    [COUNCIL_ACTIONS_PARAMS_MAPPER.newCouncilMemberWebsite]: {
      className: 'member-url',
      type: 'url',
      // cellName: 'Council Member Website',
      cellName: 'Member Website',
    },
    [COUNCIL_ACTIONS_PARAMS_MAPPER.newCouncilMemberImage]: {
      className: 'member-image',
      type: 'image',
      // cellName: 'Council Member Image',
      cellName: 'Member Image',
    },
  },
  [MavrykCounsilDdForms.REMOVE_COUNCIL_MEMBER]: {
    [COUNCIL_ACTIONS_PARAMS_MAPPER.councilMemberAddress]: {
      className: 'member-address',
      type: 'address',
      cellName: 'Council Member Address',
    },
  },

  // MAVRYK COUNCIL VESTEES FORMS
  // ------------------------------------------------------------------------------------
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
  [MavrykCounsilDdForms.UPDATE_VESTEE]: {
    [COUNCIL_ACTIONS_PARAMS_MAPPER.vesteeAddress]: {
      className: 'vestee-address',
      type: 'address',
      cellName: 'Vestee Address',
    },
    [COUNCIL_ACTIONS_PARAMS_MAPPER.newCliffInMonths]: {
      className: 'vestee-cliff-period',
      type: 'number',
      sufix: 'month',
      cellName: 'Cliff Period',
    },
    [COUNCIL_ACTIONS_PARAMS_MAPPER.newVestingInMonths]: {
      className: 'vesting-period',
      type: 'number',
      sufix: 'month',
      cellName: 'Vesting Period',
    },
    [COUNCIL_ACTIONS_PARAMS_MAPPER.newTotalAllocatedAmount]: {
      className: 'vestee-allocated-amount',
      type: 'number',
      sufix: 'MVK',
      cellName: 'Total Allocated Amount',
    },
  },
  [MavrykCounsilDdForms.TOGGLE_VESTEE_LOCK]: {
    [COUNCIL_ACTIONS_PARAMS_MAPPER.vesteeAddress]: {
      className: 'vestee-address',
      type: 'address',
      cellName: 'Vestee Address',
    },
  },
  [MavrykCounsilDdForms.REMOVE_VESTEE]: {
    [COUNCIL_ACTIONS_PARAMS_MAPPER.vesteeAddress]: {
      className: 'vestee-address',
      type: 'address',
      cellName: 'Vestee Address',
    },
  },

  // MAVRYK COUNCIL TOKENS FORMS
  // ------------------------------------------------------------------------------------
  [MavrykCounsilDdForms.REQUEST_TOKENS]: {
    [COUNCIL_ACTIONS_PARAMS_MAPPER.treasuryAddress]: {
      className: 'treasury-address',
      type: 'address',
      cellName: 'Treasury Address',
    },
    [COUNCIL_ACTIONS_PARAMS_MAPPER.tokenAmount]: {
      className: 'token-amount',
      type: 'number',
      cellName: 'Total Amount',
    },
    [COUNCIL_ACTIONS_PARAMS_MAPPER.tokenContractAddress]: {
      className: 'token-contract-address',
      type: 'address',
      cellName: 'Token Contract Address',
    },
    [COUNCIL_ACTIONS_PARAMS_MAPPER.tokenType]: {
      className: 'token-type',
      type: 'default',
      cellName: 'Token Type',
    },
    [COUNCIL_ACTIONS_PARAMS_MAPPER.tokenId]: {
      className: 'token-id',
      type: 'default',
      cellName: 'Token ID',
    },
    [COUNCIL_ACTIONS_PARAMS_MAPPER.purpose]: { className: 'purpose', type: 'default', cellName: 'Purpose for Request' },
  },
  [MavrykCounsilDdForms.REQUEST_TOKEN_MINT]: {
    [COUNCIL_ACTIONS_PARAMS_MAPPER.treasuryAddress]: {
      className: 'treasury-address',
      type: 'address',
      cellName: 'Treasury Address',
    },
    [COUNCIL_ACTIONS_PARAMS_MAPPER.tokenAmount]: {
      className: 'token-amount',
      type: 'number',
      sufix: 'MVK',
      cellName: 'Token Amount',
    },
    [COUNCIL_ACTIONS_PARAMS_MAPPER.purpose]: { className: 'purpose', type: 'default', cellName: 'Purpose for Request' },
  },
  [MavrykCounsilDdForms.TRANSFER_TOKENS]: {
    [COUNCIL_ACTIONS_PARAMS_MAPPER.receiverAddress]: {
      className: 'receiver-address',
      type: 'address',
      cellName: 'Receiver Address',
    },
    [COUNCIL_ACTIONS_PARAMS_MAPPER.tokenAmount]: {
      className: 'token-amount',
      type: 'number',
      cellName: 'Total Amount',
    },
    [COUNCIL_ACTIONS_PARAMS_MAPPER.tokenContractAddress]: {
      className: 'token-contract-address',
      type: 'address',
      cellName: 'Token Contract Address',
    },
    [COUNCIL_ACTIONS_PARAMS_MAPPER.tokenType]: {
      className: 'token-type',
      type: 'default',
      cellName: 'Token Type',
    },
    [COUNCIL_ACTIONS_PARAMS_MAPPER.tokenId]: {
      className: 'token-id',
      type: 'default',
      cellName: 'Token ID',
    },
    [COUNCIL_ACTIONS_PARAMS_MAPPER.purpose]: { className: 'purpose', type: 'default', cellName: 'Purpose for Request' },
  },

  // MAVRYK COUNCIL BAKERS FORMS
  // ------------------------------------------------------------------------------------
  [MavrykCounsilDdForms.SET_BAKER]: {
    [COUNCIL_ACTIONS_PARAMS_MAPPER.keyHash]: {
      className: 'admin-address',
      type: 'address',
      cellName: 'New Baker Address',
    },
  },
  [MavrykCounsilDdForms.SET_CONTRACT_BAKER]: {
    [COUNCIL_ACTIONS_PARAMS_MAPPER.keyHash]: {
      className: 'admin-address',
      type: 'address',
      cellName: 'New Baker Address',
    },
    [COUNCIL_ACTIONS_PARAMS_MAPPER.targetContractAddress]: {
      className: 'contract-address',
      type: 'address',
      cellName: 'Target Contract Address',
    },
  },

  // MAVRYK COUNCIL OTHER FORMS
  // ------------------------------------------------------------------------------------
  [MavrykCounsilDdForms.DROP_FINANCIAL_REQUEST]: {},

  // BREAG GLASS COUNCIL MEMBERS FORMS
  // ------------------------------------------------------------------------------------
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
  [BgCounsilDdForms.BG_CHANGE_COUNCIL_MEMBER]: {
    [COUNCIL_ACTIONS_PARAMS_MAPPER.oldCouncilMemberAddress]: {
      className: 'old-member-address',
      type: 'address',
      // cellName: 'Council Member To Change',
      cellName: 'Member To Change',
    },
    [COUNCIL_ACTIONS_PARAMS_MAPPER.newCouncilMemberAddress]: {
      className: 'member-address',
      type: 'address',
      // cellName: 'Council Member Address',
      cellName: 'New Member Address',
    },
    [COUNCIL_ACTIONS_PARAMS_MAPPER.newCouncilMemberName]: {
      className: 'member-name',
      type: 'default',
      // cellName: 'Council Member Name',
      cellName: 'Member Name',
    },
    [COUNCIL_ACTIONS_PARAMS_MAPPER.newCouncilMemberWebsite]: {
      className: 'member-url',
      type: 'url',
      // cellName: 'Council Member Website',
      cellName: 'Member Website',
    },
    [COUNCIL_ACTIONS_PARAMS_MAPPER.newCouncilMemberImage]: {
      className: 'member-image',
      type: 'image',
      // cellName: 'Council Member Image',
      cellName: 'Member Image',
    },
  },
  [BgCounsilDdForms.BG_REMOVE_COUNCIL_MEMBER]: {
    [COUNCIL_ACTIONS_PARAMS_MAPPER.councilMemberAddress]: {
      className: 'member-address',
      type: 'address',
      cellName: 'Council Member Address',
    },
  },

  // BREAG GLASS COUNCIL CONTRACTS ADMIN FORMS
  // ------------------------------------------------------------------------------------
  [BgCounsilDdForms.SET_ALL_CONTRACTS_ADMIN]: {
    [COUNCIL_ACTIONS_PARAMS_MAPPER.newAdminAddress]: {
      className: 'admin-address',
      type: 'address',
      cellName: 'New Admin Address',
    },
  },
  [BgCounsilDdForms.SET_SELECTED_CONTRACTS_ADMIN]: {},

  // BREAG GLASS COUNCIL CONTRACTS OTHER FORMS
  // ------------------------------------------------------------------------------------
  [BgCounsilDdForms.REMOVE_BREAK_GLASS_CONTROLL]: {},
  [BgCounsilDdForms.SIGN_ACTION]: {},
  [BgCounsilDdForms.UNPAUSE_ALL_ENTRYPOINTS]: {},
}

// grid setting for council sign cards
// TODO: fill other cards grid settings when data for testing will be avaliable
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
    columnsTemplate: `auto auto 180px`, // ready
    rowsTemplate: `1fr 1fr`,
    areaTemplate: `
      "member-address member-name signed-amount"
      "member-image member-url sign-btn"
    `,
  },
  [MavrykCounsilDdForms.CHANGE_COUNCIL_MEMBER]: {
    columnsTemplate: `auto auto auto 150px`, // ready, need to clarify new header text with Sam
    rowsTemplate: `1fr 1fr`,
    areaTemplate: `
      "old-member-address member-address member-name signed-amount"
      "member-image member-url member-url sign-btn"
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
    columnsTemplate: `auto auto 180px`, // ready
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
    columnsTemplate: `380px auto`, // ready, but need to test on real data
    rowsTemplate: `auto`,
    areaTemplate: `
      "vestee-address sign-btn"
    `,
  },
  [MavrykCounsilDdForms.REMOVE_VESTEE]: {
    columnsTemplate: `auto auto`, // ready
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
    columnsTemplate: `auto auto 180px`, // ready
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
    columnsTemplate: `1fr 1fr`, // ready
    rowsTemplate: `1fr 1fr`,
    areaTemplate: `
      "admin-address signed-amount"
      "sign-btn sign-btn"
    `,
  },
  [MavrykCounsilDdForms.SET_CONTRACT_BAKER]: {
    columnsTemplate: `1fr 150px`, // ready
    rowsTemplate: `1fr 1fr`,
    areaTemplate: `
      "admin-address signed-amount"
      "contract-address sign-btn"
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
    columnsTemplate: `auto auto 180px`, // ready
    rowsTemplate: `1fr 1fr`,
    areaTemplate: `
      "member-address member-name signed-amount"
      "member-image member-url sign-btn"
    `,
  },
  [BgCounsilDdForms.BG_CHANGE_COUNCIL_MEMBER]: {
    columnsTemplate: `auto auto auto 150px`, // ready, need to clarify new header text with Sam
    rowsTemplate: `1fr 1fr`,
    areaTemplate: `
      "old-member-address member-address member-name signed-amount"
      "member-image member-url member-url sign-btn"
    `,
  },
  [BgCounsilDdForms.BG_REMOVE_COUNCIL_MEMBER]: {
    columnsTemplate: `auto auto`, // ready
    rowsTemplate: `1fr 1fr`,
    areaTemplate: `
      "member-address signed-amount"
      "sign-btn sign-btn"
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
