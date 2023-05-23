import { ProposalStatusType } from 'utils/TypesAndInterfaces/Governance'

export const STATUS_FLAG_UP = 'STATUS_FLAG_UP'
export const STATUS_FLAG_DOWN = 'STATUS_FLAG_DOWN'
export const STATUS_FLAG_INFO = 'STATUS_FLAG_INFO'
export const STATUS_FLAG_WARNING = 'STATUS_FLAG_WARNING'
export const STATUS_FLAG_WAITING = 'STATUS_FLAG_WAITING'

export type StatusFlagKind =
  | typeof STATUS_FLAG_UP
  | typeof STATUS_FLAG_DOWN
  | typeof STATUS_FLAG_WARNING
  | typeof STATUS_FLAG_WAITING
  | typeof STATUS_FLAG_INFO
  | ProposalStatusType
