export const INPUT_PRIMARY = 'primary'
export const INPUT_SEARCH = 'search'
export const INPUT_STATUS_SUCCESS = 'success'
export const INPUT_STATUS_ERROR = 'error'
export const INPUT_STATUS_DEFAULT = ''

export const INPUT_MEDIUM = 'medium-input'
export const INPUT_SMALL = 'small-input'
export const INPUT_LARGE = 'large-input'
export const INPUT_BIG = 'big-input'

export type InputSizeType = typeof INPUT_SMALL | typeof INPUT_MEDIUM | typeof INPUT_LARGE | typeof INPUT_BIG
export type InputStatusType =
  | typeof INPUT_STATUS_SUCCESS
  | typeof INPUT_STATUS_ERROR
  | typeof INPUT_STATUS_DEFAULT
  | ''
  | undefined
export type InputKind = typeof INPUT_PRIMARY | typeof INPUT_SEARCH

// default max length
export const defaultCouncilMemberImageMaxLength = 500
export const defaultCouncilMemberNameMaxLength = 25
export const defaultCouncilMemberWebsiteMaxLength = 500
export const defaultRequestPurposeMaxLength = 800
export const defaultRequestTokenNameMaxLength = 20
export const defaultSatelliteDescriptionMaxLength = 800
export const defaultSatelliteImageMaxLength = 500
export const defaultSatelliteNameMaxLength = 20
export const defaultSatelliteWebsiteMaxLength = 500
export const defaultGovPurposeMaxLength = 800
export const defaultProposalInvoiceMaxLength = 50
export const defaultProposalMetadataTitleMaxLength = 110
export const defaultProposalDescriptionMaxLength = 800
export const defaultProposalTitleMaxLength = 70
export const defaultProposalSourceCodeMaxLength = 100_000
export const defaultAggregatorNameMaxLength = 35
export const defaultTreasuryNameMaxLength = 25
export const defaultOraclePeerIdMaxLength = 52
