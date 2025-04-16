import { ColorBreakpoint } from 'app/App.components/GriadientFillDiagram/GradientDiagram'
import { MavenTheme } from 'styles/interfaces'
import { z } from 'zod'

export const LEND_TAB_ID = 'lendingTab'
export const BORROW_TAB_ID = 'borrowTab'
export const ASSETS_WE_HAVE_BG_TO = ['EURL', 'USDT']

export const VAULT_CARD_MENU_TABS = [
  {
    text: 'Collateral Assets',
    id: 1,
    active: true,
  },
  {
    text: 'TX History',
    id: 2,
    active: false,
  },
  {
    text: 'Useful Info',
    id: 3,
    active: false,
  },
]

export const VAULT_CARD_REPAY_BORROW_SLIDING_BUTTONS = [
  {
    text: 'Borrow',
    id: 4,
    active: true,
  },
  {
    text: 'Repay',
    id: 5,
    active: false,
  },
]

export const VAULT_CARD_REPAY_SLIDING_BUTTONS = [
  {
    text: 'Repay in Part',
    id: 6,
    active: true,
  },
  {
    text: 'Repay in Full',
    id: 7,
    active: false,
  },
]

export const VAULT_TRANSACTION_HISTORY_SLIDING_BUTTONS = [
  {
    text: 'View All',
    id: 8,
    active: true,
  },
  {
    text: 'View Personal',
    id: 9,
    active: false,
  },
]

export const LENDING_TAB_SLIDING_BUTTONS = [
  {
    text: 'Deposit',
    id: 10,
    active: true,
  },
  {
    text: 'Withdraw',
    id: 11,
    active: false,
  },
]

export const loansTabNames = {
  COLLATERAL_ASSETS: 1,
  TX_HISTORY: 2,
  USEFUL_INFO: 3,
  BORROW: 4,
  REPAY: 5,
  REPAY_IN_PART: 6,
  REPAY_IN_FULL: 7,
  TX_HISTORY_VIEW_ALL: 8,
  TX_HISTORY_VIEW_PERSONAL: 9,
  SUPPLY: 10,
  WITHDRAW: 11,
} as const

export const PRIMARY_TRANSACTION_HISTORY_STYLE = 'PRIMARY_TRANSACTION_HISTORY_STYLE'
export const SECONDARY_TRANSACTION_HISTORY_STYLE = 'SECONDARY_TRANSACTION_HISTORY_STYLE'

export const ANY_USER = 'any'
export const NONE_USER = 'none'
export const WHITELIST_USERS = 'whitelist'

export const VAULT_ALLOWANCE_ANY = 'any'
export const VAULT_ALLOWANCE_ACCOUNTS = 'whitelist'

export const ADD_COLLATERAL_MODAL_ID = 'addCollateral'
export const ADD_NEW_COLLATERAL_MODAL_ID = 'addNewCollateral'
export const ADD_LENDING_ASSET_MODAL_ID = 'addLendingAsset'
export const BORROW_ASSET_MODAL_ID = 'borrowAsset'
export const CHANGE_BAKER_MODAL_ID = 'changeBaker'
export const CREATE_NEW_VAULT_MODAL_ID = 'createNewVault'
export const MANAGE_PERMISSIONS_MODAL_ID = 'managePermissions'
export const REMOVE_ASSET_LENDING_MODAL_ID = 'removeAssetsFromLending'
export const REPAY_MODAL_ID = 'repayVault'
export const REPAY_AND_CLOSE_MODAL_ID = 'repayAndCloseVault'
export const UPDATE_MVN_OPERATORS_MODAL_ID = 'updateMVNOperators'
export const WITHDRAW_COLLATERAL_MODAL_ID = 'withdrawCollateral'

export const getCollateralRatioPercentColor = (theme: MavenTheme, percentage: number) => {
  if (percentage === 0) return theme.subHeadingText

  const color = COLLATERAL_RATIO_GRADIENT.find(({ value }) => {
    if (percentage < 100) {
      return value === 100
    }

    if (percentage > 250) {
      return value === 250
    }

    return value + 50 > percentage && value - 50 < percentage
  })?.color

  return color ? `rgb(${color.r}, ${color.g}, ${color.b})` : theme.placeholders
}

export const COLLATERAL_RATIO_GRADIENT: Array<ColorBreakpoint> = [
  {
    percentage: 0,
    color: {
      r: 255,
      g: 67,
      b: 67,
    },
    value: 100,
  },
  {
    percentage: 33,
    color: {
      r: 255,
      g: 120,
      b: 90,
    },
    value: 150,
  },
  {
    percentage: 66,
    color: {
      r: 110,
      g: 255,
      b: 110,
    },
    value: 200,
  },
  {
    percentage: 100,
    color: {
      r: 52,
      g: 246,
      b: 106,
    },
    value: 250,
  },
]

export const assetDecimalsToShow = 8

export const CHART_SETTINGS = {
  width: 450,
  height: 270,
  hideXAxis: true,
  hideYAxis: true,
  isPeriod: true,
}

export const tokenCollateralSchema = z.record(
  z.string(),
  z.object({
    aggregate: z.object({
      sum: z.object({
        balance: z.number(),
        loan_outstanding_total: z.number(),
      }),
    }),
  }),
)

export type CollateralResponse = z.infer<typeof tokenCollateralSchema>

export type RawTotalCollateralBalances = {
  totalCollateral: number
  tottalBorrowed: number
}
