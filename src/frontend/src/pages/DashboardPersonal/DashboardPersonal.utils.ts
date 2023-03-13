export const PORTFOLIO_TAB_ID = 'portfolio'
export const SATELLITE_TAB_ID = 'satellite'
export const DELEGATION_TAB_ID = 'delegation'
export const VESTING_TAB_ID = 'vesting'

export const PORTFOLIO_POSITION_TAB_ID = 'lendBorrowPositon'
export const PORTFOLIO_LENDING_TAB_ID = 'lendingTx'
export const PORTFOLIO_BORROWING_TAB_ID = 'borrowingTx'

export type TabId = typeof PORTFOLIO_TAB_ID | typeof SATELLITE_TAB_ID | typeof DELEGATION_TAB_ID | typeof VESTING_TAB_ID

export const isValidId = (x: string): x is TabId =>
  x === PORTFOLIO_TAB_ID || x === SATELLITE_TAB_ID || x === DELEGATION_TAB_ID || x === VESTING_TAB_ID
