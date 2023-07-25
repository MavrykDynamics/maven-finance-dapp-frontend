import { CreateVaultModalState, VaultInputState } from './createNewVault.types'

export const INITIAL_SCREEN_ID = 'createVault'
export const ADD_COLLATERAL_SCREEN_ID = 'addCollateral'
export const BORROW_SCREEN_ID = 'borrow'
export const CONFIRMATION_SCREEN_ID = 'confirmation'

// default vault state
export const DEFAULT_VAULT_STATE: VaultInputState = { name: '', validationStatus: '', errorMessage: '' }

export const DEFAULT_CREATE_VAULT_STATE: CreateVaultModalState = {
  vault: DEFAULT_VAULT_STATE,
  screenToShow: INITIAL_SCREEN_ID,
  isVaultCreating: false,
  selectedCollaterals: {},
  selectedCollateralsAddresses: [],
  newVault: null,
}
