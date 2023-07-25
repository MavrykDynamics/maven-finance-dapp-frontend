import { InputStatusType } from 'app/App.components/Input/Input.constants'
import {
  ADD_COLLATERAL_SCREEN_ID,
  BORROW_SCREEN_ID,
  CONFIRMATION_SCREEN_ID,
  INITIAL_SCREEN_ID,
} from './createNewVault.consts'
import { TokenAddressType } from 'providers/TokensProvider/tokens.provider.types'

export type ScreenType =
  | typeof INITIAL_SCREEN_ID
  | typeof ADD_COLLATERAL_SCREEN_ID
  | typeof BORROW_SCREEN_ID
  | typeof CONFIRMATION_SCREEN_ID

export type VaultInputState = {
  validationStatus: InputStatusType
  errorMessage: string
  name: string
}

export type NewVaultType = {
  id: number
  address: string
} | null

export type SelectedCollateralsType = Record<
  TokenAddressType,
  { tokenAddress: TokenAddressType; amount: string; validation: InputStatusType }
>

// create vault modal context
export type CreateVaultModalState = {
  screenToShow: ScreenType
  vaultInputState: VaultInputState
  selectedCollaterals: SelectedCollateralsType
  selectedCollateralsAddresses: string[]
  isVaultCreating: boolean
  newVault: NewVaultType
  hasXTZTokenSelected: string | undefined
}

export type CreateVaultModalContext = CreateVaultModalState & {
  resetCreateVaultModalState: () => void
  updateScreenToShow: (screenId: ScreenType) => void
  updateInputVaultState: (vaultData: Partial<VaultInputState>) => void
  updateVaultCreating: (value: boolean) => void
  updateNewVault: (newVault: NewVaultType) => void
  updateSelectedCollaterals: (selectedCollaterals: SelectedCollateralsType) => void
}
