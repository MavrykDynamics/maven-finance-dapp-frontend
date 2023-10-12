import { MavrykCounsilDdForms, BgCounsilDdForms } from 'pages/Council/helpers/council.consts'
import { CouncilActionsParamsColumnsType } from 'pages/Council/helpers/council.types'
import { COUNCIL_ACTIONS_PARAMS_MAPPER } from 'providers/CouncilProvider/helpers/council.consts'
import { CouncilsFormsIds } from 'providers/CouncilProvider/helpers/council.types'

// grid setting for council card bodies
export const getCouncilActionsBodiesGridSettings = (
  formId: CouncilsFormsIds | null,
): {
  columnsTemplate: string
  rowsTemplate: string
  areaTemplate: string
} => {
  switch (formId) {
    case MavrykCounsilDdForms.ADD_COUNCIL_MEMBER:
    case BgCounsilDdForms.BG_ADD_COUNCIL_MEMBER:
      return {
        columnsTemplate: `1fr 1fr 250px`,
        rowsTemplate: `auto auto`,
        areaTemplate: `
          "member-address member-name member-url"
          "member-image . drop-btn"
        `,
      }

    case MavrykCounsilDdForms.CHANGE_COUNCIL_MEMBER:
    case BgCounsilDdForms.BG_CHANGE_COUNCIL_MEMBER:
      return {
        columnsTemplate: `1fr 1fr 250px`,
        rowsTemplate: `auto auto`,
        areaTemplate: `
          "old-member-address member-name member-url"
          "member-address member-image drop-btn"
        `,
      }

    case MavrykCounsilDdForms.REMOVE_COUNCIL_MEMBER:
    case BgCounsilDdForms.BG_REMOVE_COUNCIL_MEMBER:
      return {
        columnsTemplate: `1fr 250px`,
        rowsTemplate: `auto`,
        areaTemplate: `
          "member-address drop-btn"
        `,
      }
    default:
      return {
        columnsTemplate: `1fr 250px`,
        rowsTemplate: `auto`,
        areaTemplate: `
          "action-meta drop-btn"
        `,
      }
  }
}

// mapper for showing only allowed cells on user's ongoing action card
export const CouncilUserOngoingActionGridCellsMapper: CouncilActionsParamsColumnsType = {
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
  [MavrykCounsilDdForms.CHANGE_COUNCIL_MEMBER]: {
    [COUNCIL_ACTIONS_PARAMS_MAPPER.newCouncilMemberAddress]: {
      className: 'member-address',
      type: 'address',
      cellName: 'New Council Member Address',
    },
    [COUNCIL_ACTIONS_PARAMS_MAPPER.oldCouncilMemberAddress]: {
      className: 'old-member-address',
      type: 'address',
      cellName: 'Old Council Member Address',
    },
    [COUNCIL_ACTIONS_PARAMS_MAPPER.newCouncilMemberName]: {
      className: 'member-name',
      type: 'default',
      cellName: 'Council Member Name',
    },
    [COUNCIL_ACTIONS_PARAMS_MAPPER.newCouncilMemberWebsite]: {
      className: 'member-url',
      type: 'url',
      cellName: 'Council Member Website',
    },
    [COUNCIL_ACTIONS_PARAMS_MAPPER.newCouncilMemberImage]: {
      className: 'member-image',
      type: 'image',
      cellName: 'Council Member Image',
    },
  },
  [MavrykCounsilDdForms.REMOVE_COUNCIL_MEMBER]: {
    [COUNCIL_ACTIONS_PARAMS_MAPPER.councilMemberAddress]: {
      className: 'member-address',
      type: 'address',
      cellName: 'Council Member Address',
    },
  },
}
