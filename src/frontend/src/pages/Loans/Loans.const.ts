export const LEND_TAB_ID = 'lendingTab'
export const BORROW_TAB_ID = 'borrowTab'
export const PERMISSIONS_VAULTS_TAB_ID = 'permissionsVaultsTab'
export const ASSETS_WE_HAVE_BG_TO = ['TEZ', 'EURL', 'USDT']

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
export const UPDATE_MVK_OPERATORS_MODAL_ID = 'updateMVKOperators'
export const WITHDRAW_COLLATERAL_MODAL_ID = 'withdrawCollateral'

export const BORROWIND_MOCK = [{}, {}]
export const COLLATERAL_MOCK = [
  { assetSymbol: 'xtz', balance: 1, assetRate: 1, maxWithdraw: 1, assetIcon: undefined },
  // { assetSymbol: 'xtz', balance: 1, assetRate: 1, maxWithdraw: 1, assetIcon: undefined },
  { assetSymbol: 'Total', balance: 1, assetRate: 1, maxWithdraw: 1, assetIcon: undefined },
]
