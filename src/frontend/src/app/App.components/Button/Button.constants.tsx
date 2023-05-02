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

// new button consts
export const BUTTON_PRIMARY = 'primary'
export const BUTTON_SECONDARY = 'secondary'
export const BUTTON_SECONDARY_PURPLE = 'secondary-purple'
export const BUTTON_THIRD = 'third'
export const BUTTON_SIMPLE = 'simple'
export const BUTTON_SIMPLE_SMALL = 'simpleSmall'
export const BUTTON_NAVIGATION = 'navigation'
export const VOTING_FOR = `for`
export const VOTING_PASS = `pass`
export const VOTING_AGAINST = `against`

export type ButtonKind =
  | typeof BUTTON_PRIMARY
  | typeof BUTTON_SECONDARY
  | typeof BUTTON_SECONDARY_PURPLE
  | typeof BUTTON_THIRD
  | typeof BUTTON_SIMPLE
  | typeof BUTTON_SIMPLE_SMALL
  | typeof BUTTON_NAVIGATION
  | typeof VOTING_AGAINST
  | typeof VOTING_PASS
  | typeof VOTING_FOR

export const BUTTON_ROUND = 'round'
export const BUTTON_WIDE = 'wide'
export type ButtonForm = typeof BUTTON_ROUND | typeof BUTTON_WIDE

export const BUTTON_LARGE = 'large'
export const BUTTON_REGULAR = 'regular'
export type ButtonSize = typeof BUTTON_LARGE | typeof BUTTON_REGULAR

export const BUTTON_PULSE = 'pulse'
export type ButtonAnimation = typeof BUTTON_PULSE
