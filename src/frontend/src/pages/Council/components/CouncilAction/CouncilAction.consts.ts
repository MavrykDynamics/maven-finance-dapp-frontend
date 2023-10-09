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

export const COUNCIL_ACTIONS_BODY_COLUMS_MAPPER: Record<string, string> = {
  // addresses
  councilMemberAddress: 'member-address',
  newCouncilMemberAddress: 'member-address',
  oldCouncilMemberAddress: 'old-member-address',

  // names
  newCouncilMemberName: 'member-name',
  councilMemberName: 'member-name',

  // websites
  newCouncilMemberWebsite: 'member-url',
  councilMemberWebsite: 'member-url',

  // images
  newCouncilMemberImage: 'member-image',
  councilMemberImage: 'member-image',
}
