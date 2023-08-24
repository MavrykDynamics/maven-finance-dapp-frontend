import {
  SATELLITES_GOVERNANCE_CURRENT_USER_ACTIONS_SUB,
  SATELLITES_GOVERNANCE_ONGOING_ACTIONS_SUB,
  SATELLITES_GOVERNANCE_PAST_ACTIONS_SUB,
} from 'providers/SatellitesGovernanceProvider/helpers/satellitesGov.consts'

export const TAB_ID_ONGOING = 'ongoing'
export const TAB_ID_PAST = 'past'
export const TAB_ID_MY = 'my'

export const TAB_IDS_ARR = [TAB_ID_ONGOING, TAB_ID_PAST, TAB_ID_MY]

export type TabIdType = typeof TAB_ID_ONGOING | typeof TAB_ID_PAST | typeof TAB_ID_MY | (string & {})

export function getSatelliteGovSub(tabId: TabIdType) {
  switch (tabId) {
    case TAB_ID_ONGOING:
      return SATELLITES_GOVERNANCE_ONGOING_ACTIONS_SUB
    case TAB_ID_PAST:
      return SATELLITES_GOVERNANCE_PAST_ACTIONS_SUB
    case TAB_ID_MY:
      return SATELLITES_GOVERNANCE_CURRENT_USER_ACTIONS_SUB
    default:
      return null
  }
}
