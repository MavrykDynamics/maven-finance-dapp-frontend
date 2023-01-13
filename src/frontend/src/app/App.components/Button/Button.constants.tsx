export const BUTTON = 'button'
export const SUBMIT = 'submit'
export const RESET = 'reset'
export type ButtonTypes = typeof BUTTON | typeof SUBMIT | typeof RESET | undefined

export const PRIMARY = 'primary'
export const SECONDARY = 'secondary'
export const TRANSPARENT = 'transparent'
export const TRANSPARENT_WITH_BORDER = 'transparentWithBorder'
export const ACTION_PRIMARY = 'actionPrimary'
export const ACTION_SIMPLE = 'actionSimple'
export const NAV_SIMPLE = 'navigationSimple'
export const ACTION_SECONDARY = 'actionSecondary'
export const VOTING_FOR = 'votingFor'
export const VOTING_AGAINST = 'votingAgainst'
export const VOTING_ABSTAIN = 'votingAbstain'

export type ButtonStyle =
  | typeof PRIMARY
  | typeof SECONDARY
  | typeof TRANSPARENT
  | typeof TRANSPARENT_WITH_BORDER
  | typeof NAV_SIMPLE
  | typeof VOTING_FOR
  | typeof VOTING_AGAINST
  | typeof VOTING_ABSTAIN
  | typeof ACTION_PRIMARY
  | typeof ACTION_SECONDARY
  | typeof ACTION_SIMPLE
  | undefined
