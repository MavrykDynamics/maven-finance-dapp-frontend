import { MavrykCounsilDdForms, BgCounsilDdForms } from 'pages/Council/helpers/council.consts'
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

export type CouncilActionsBodyColumnsType = Record<
  string,
  {
    className: string
    type: 'address' | 'image' | 'url' | 'default'
  }
>

// mapper for action params fields, only those are outputted on client only
// used to check whether client show field for user and getting grid-area classname
export const COUNCIL_ACTIONS_BODY_COLUMS_MAPPER: CouncilActionsBodyColumnsType = {
  // addresses
  councilMemberAddress: { className: 'member-address', type: 'address' },
  newCouncilMemberAddress: { className: 'member-address', type: 'address' },
  oldCouncilMemberAddress: { className: 'old-member-address', type: 'address' },

  // names
  newCouncilMemberName: { className: 'member-name', type: 'default' },
  councilMemberName: { className: 'member-name', type: 'default' },

  // websites
  newCouncilMemberWebsite: { className: 'member-url', type: 'url' },
  councilMemberWebsite: { className: 'member-url', type: 'url' },

  // images
  newCouncilMemberImage: { className: 'member-image', type: 'image' },
  councilMemberImage: { className: 'member-image', type: 'image' },
}
