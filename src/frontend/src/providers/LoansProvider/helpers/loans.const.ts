export const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000

export const LOANS_HISTORY_DATA_TYPES = {
  addLiquidity: 0,
  removeLiquidity: 1,
  borrow: 2,
  repay: 3,
  depositCollateral: 4,
  withdrawCollateral: 5,
  depositStakedCollateral: 6,
  withdrawStakedCollateral: 7,
} as const

export const COLLATERAL_HISTORY_DATA_TYPES = [
  LOANS_HISTORY_DATA_TYPES.depositCollateral,
  LOANS_HISTORY_DATA_TYPES.depositStakedCollateral,
  LOANS_HISTORY_DATA_TYPES.withdrawCollateral,
  LOANS_HISTORY_DATA_TYPES.withdrawStakedCollateral,
]

export const BORROWING_HISTORY_DATA_TYPES = [LOANS_HISTORY_DATA_TYPES.borrow, LOANS_HISTORY_DATA_TYPES.repay]

export const LIQUIDITY_HISTORY_DATA_TYPES = [
  LOANS_HISTORY_DATA_TYPES.addLiquidity,
  LOANS_HISTORY_DATA_TYPES.removeLiquidity,
]
