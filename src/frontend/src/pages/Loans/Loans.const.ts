export const LEND_TAB_ID = 'lendingTab'
export const BORROW_TAB_ID = 'borrowTab'
export const PERMISSIONS_VAULTS_TAB_ID = 'permissionsVaultsTab'
export const ASSETS_WE_HAVE_BG_TO = ['XTZ', 'EURL', 'USDT']

export const TRANSACTION_HISTORY_SLIDING_BUTTONS = [
  {
    text: 'View All',
    id: 0,
    active: true,
  },
  {
    text: 'View Personal',
    id: 1,
    active: false,
  },
]

export const UPDATE_MVK_OPERATORS_MODAL_ID = 'updateMVKoperatorsModal'
export const MANAGE_PERMISSIONS_MODAL_ID = 'managePermissionsModal'
export const ADD_COLLATERAL_MODAL_ID = 'addCollateralModal'
export const REMOVE_COLLATERAL_MODAL_ID = 'removeCollateralModal'
export const BORROW_ASSET_MODAL_ID = 'borrowAssetModal'
export const REPAY_MODAL_ID = 'repayModal'
export const CLOSE_VAULT_MODAL_ID = 'closeVaultModal'

export const BORROWIND_MOCK = [{}, {}]
export const COLLATERAL_MOCK = [
  { assetSymbol: 'xtz', balance: 1, assetRate: 1, maxWithdraw: 1, assetIcon: undefined },
  { assetSymbol: 'xtz', balance: 1, assetRate: 1, maxWithdraw: 1, assetIcon: undefined },
  { assetSymbol: 'Total', balance: 1, assetRate: 1, maxWithdraw: 1, assetIcon: undefined },
]
