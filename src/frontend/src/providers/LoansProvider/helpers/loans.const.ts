import { LoansContextState } from '../loans.provider.types'

export const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000

// actions
export const CREATE_NEW_VAULT_ACTION = 'createNewVaultAction'
export const DEPOSIT_LENDING_ASSET_ACTION = 'depositLendingAssetAction'
export const WITHDRAW_LENDING_ASSET_ACTION = 'withdrawLendingAssetAction'

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

// CONSTS FOR STAKING PROVIDER STATES
export const LOANS_MARKETS_DATA = 'loansMarkets'
export const LOANS_CONFIG = 'loansConfig'

// PROVIDER DEFAULT CONSTS
export const DEFAULT_LOANS_ACTIVE_SUBS = {
  [LOANS_MARKETS_DATA]: false,
  [LOANS_CONFIG]: false,
} as const

export const DEFAULT_LOANS_CONTEXT: LoansContextState = {
  allMarketsAddresses: null,
  marketsAddresses: null,
  marketsMapper: null,
  config: null,
}

export const EMPTY_LOANS_CONTEXT: DeepNonNullable<LoansContextState> = {
  allMarketsAddresses: [],
  marketsAddresses: [],
  marketsMapper: {},
  config: {
    daoFee: 0,
    collateralFactor: 0,
  },
}
