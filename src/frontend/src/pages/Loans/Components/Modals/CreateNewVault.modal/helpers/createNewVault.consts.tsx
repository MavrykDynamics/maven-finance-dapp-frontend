import { CreateVaultModalState, VaultInputState } from './createNewVault.types'

export const INITIAL_SCREEN_ID = 'createVault'
export const ADD_COLLATERAL_SCREEN_ID = 'addCollateral'
export const CONFIRM_STATS_SCREEN_ID = 'confirmStats'
export const BORROW_SCREEN_ID = 'borrow'
export const CONFIRMATION_SCREEN_ID = 'confirmation'

// default vault state
export const DEFAULT_VAULT_STATE: VaultInputState = { name: '', validationStatus: '', errorMessage: '' }

export const DEFAULT_CREATE_VAULT_STATE: CreateVaultModalState = {
  vaultInputState: DEFAULT_VAULT_STATE,
  screenToShow: INITIAL_SCREEN_ID,
  isVaultCreating: false,
  selectedCollaterals: {},
  selectedCollateralsAddresses: [],
  newVault: {
    id: 0,
    address: '',
  },
  hasXTZTokenSelected: undefined,
  finalBorrowInputData: {
    amount: 0,
    symbol: '',
    rate: 0,
  },
}

export const screenTitles = {
  [INITIAL_SCREEN_ID]: 'Create New Vault',
  [ADD_COLLATERAL_SCREEN_ID]: 'Select Collateral For Vault',
  [CONFIRM_STATS_SCREEN_ID]: 'Confirm Vault Stats & Create',
  [BORROW_SCREEN_ID]: 'Borrow',
  [CONFIRMATION_SCREEN_ID]: 'Confirmation',
}

export const screenDescriptions = {
  [INITIAL_SCREEN_ID]: (
    <>
      Create a personal vault to begin borrowing.
      <br /> You may only choose one asset (USDT, EURL, or XTZ) to be borrowed per vault. In your vault, you may deposit
      a basket of assets such as XTZ, tzBTC, USDT, and EURL together as collateral.
    </>
  ),

  [ADD_COLLATERAL_SCREEN_ID]:
    'Select an one or multiple assets to add as collateral.  If you are providing XTZ as collateral, make sure you select a baker. ',
  [CONFIRM_STATS_SCREEN_ID]: 'Please confirm the following details.',
  [BORROW_SCREEN_ID]: 'Select the amount you would like to borrow. You cannot borrow more than your borrow capacity.',
  [CONFIRMATION_SCREEN_ID]: 'Please confirm the following details.',
}

export const stepperItemsObj = {
  [INITIAL_SCREEN_ID]: 'Create Vault',
  [ADD_COLLATERAL_SCREEN_ID]: 'Add Collateral',
  [CONFIRM_STATS_SCREEN_ID]: 'Confirm Stats',
  [BORROW_SCREEN_ID]: 'Borrow',
  [CONFIRMATION_SCREEN_ID]: 'Confirm Borrow',
}

export const stepperItems = Object.values(stepperItemsObj)
