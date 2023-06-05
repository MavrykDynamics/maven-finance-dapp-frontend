import { ValidationResult } from 'pages/ProposalSubmission/ProposalSubmission.types'
import { TokenType } from 'utils/TypesAndInterfaces/General'
import { SatelliteGovernanceTransfer } from 'utils/TypesAndInterfaces/Satellites'

export const SATELLITE_GOVERNANCE_CONTENT_FORM = new Map([
  [
    'Suspend Satellite',
    {
      title: 'Suspend Satellite',
      btnText: 'Suspend Satellite',
      btnIcon: 'minus',
      firstInputLabel: 'Your Address',
      secondInputLabel: '',
    },
  ],
  [
    'Unsuspend Satellite',
    {
      title: 'Unsuspend Satellite',
      btnText: 'Unsuspend Satellite',
      btnIcon: 'plus',
      firstInputLabel: 'Your Address',
      secondInputLabel: '',
    },
  ],
  [
    'Ban Satellite',
    {
      title: 'Ban Satellite',
      btnText: 'Ban Satellite',
      btnIcon: 'navigation-menu_close',
      firstInputLabel: 'Your Address',
      secondInputLabel: '',
    },
  ],
  [
    'Unban Satellite',
    {
      title: 'Unban Satellite',
      btnText: 'Unban Satellite',
      btnIcon: 'plus',
      firstInputLabel: 'Your Address',
      secondInputLabel: '',
    },
  ],
  [
    'Remove Oracles',
    {
      title: 'Remove all Oracles from Satellite',
      btnText: 'Remove Oracles',
      btnIcon: 'minus',
      firstInputLabel: 'Your Address',
      secondInputLabel: '',
    },
  ],
  [
    'Remove from Aggregator',
    {
      title: 'Remove from Aggregator',
      btnText: 'Remove from Aggregator',
      btnIcon: 'minus',
      firstInputLabel: 'Your Address',
      secondInputLabel: '',
    },
  ],
  [
    'Add to Aggregator',
    {
      title: 'Add Oracle to Aggregator',
      btnText: 'Add to Aggregator',
      btnIcon: 'plus',
      firstInputLabel: 'Your Address',
      secondInputLabel: '',
    },
  ],
  [
    'Restore Satellite',
    {
      title: 'Restore Satellite',
      btnText: 'Restore Satellite',
      btnIcon: 'restore',
      firstInputLabel: 'Your Address',
      secondInputLabel: '',
    },
  ],
  [
    'Set Aggregator Maintainer',
    {
      title: 'Set Aggregator Maintainer',
      btnText: 'Set Aggregator Maintainer',
      btnIcon: 'gear',
      firstInputLabel: 'Maintainer',
      secondInputLabel: 'Aggregator Address',
    },
  ],
  [
    'Update Aggregator Status',
    {
      title: 'Update Aggregator Status',
      btnText: 'Update Aggregator Status',
      btnIcon: 'update',
      firstInputLabel: 'Status',
      secondInputLabel: 'Aggregator Address',
    },
  ],
  [
    'Register Aggregator',
    {
      title: 'Register Aggregator',
      btnText: 'Register Aggregator',
      btnIcon: 'plus',
      firstInputLabel: 'Aggregator Pair',
      secondInputLabel: 'Aggregator Address',
    },
  ],
  [
    'Fix Mistaken Transfer',
    {
      title: 'Fix Mistaken Transfer',
      btnText: 'Fix Mistaken Transfer',
      btnIcon: 'gear',
      firstInputLabel: 'Target Contract Address',
      secondInputLabel: 'Purpose',
    },
  ],
])

export const SATELLITE_GOVERNANCE_ACTION_NAMES = {
  SUSPEND_SATELLITE: 'Suspend Satellite',
  UNSUSPEND_SATELLITE: 'Unsuspend Satellite',
  BAN_SATELLITE: 'Ban Satellite',
  UNBAN_SATELLITE: 'Unban Satellite',
  REMOVE_ORACLES: 'Remove Oracles',
  REMOVE_FROM_AGREGATOR: 'Remove from Aggregator',
  ADD_TO_AGGREGATOR: 'Add to Aggregator',
  RESTORE_SATELLITE: 'Restore Satellite',
  SET_AGREGATOR_MANTAINER: 'Set Aggregator Maintainer',
  UPDATE_AGREGATOR_STATUS: 'Update Aggregator Status',
  REGISTER_AGGREGATOR: 'Register Aggregator',
  FIX_MISTAKEN_TRANSFER: 'Fix Mistaken Transfer',
} as const

// TODO: filtered according to [MAV-1404]. Remove filter for allow all actions
export const SATELLITE_GOVERNANCE_ACTIONS = Object.values(SATELLITE_GOVERNANCE_ACTION_NAMES).filter(
  (name) =>
    name !== SATELLITE_GOVERNANCE_ACTION_NAMES.SET_AGREGATOR_MANTAINER &&
    name !== SATELLITE_GOVERNANCE_ACTION_NAMES.REGISTER_AGGREGATOR &&
    name !== SATELLITE_GOVERNANCE_ACTION_NAMES.UPDATE_AGREGATOR_STATUS,
)

export const SATELLITE_GOVERNANCE_MENU_TABS = {
  ONGOING: 'ongoing',
  PAST: 'past',
  MY: 'my',
} as const

export const SATELLITE_GOVERNANCE_PATHNAME = '/satellite-governance'

export const SATELLITE_GOVERNANCE_TOKEN_TYPES: Array<TokenType> = ['fa12', 'fa2', 'tez']
export const SATELLITE_GOVERNANCE_DEFAULT_TABLE: Array<SatelliteGovernanceTransfer> = [
  { to_: '', amount: 0, token: SATELLITE_GOVERNANCE_TOKEN_TYPES[0] },
]
export const SATELLITE_GOVERNANCE_DEFAULT_TABLE_VALIDATION: Array<{
  to_: ValidationResult
  amount: ValidationResult
}> = [{ to_: '', amount: '' }]
