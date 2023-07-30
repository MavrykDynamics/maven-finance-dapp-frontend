import { InputStatusType } from 'app/App.components/Input/Input.constants'
import {
  ADD_COLLATERAL_SCREEN_ID,
  BORROW_SCREEN_ID,
  CONFIRMATION_SCREEN_ID,
  INITIAL_SCREEN_ID,
} from './createNewVault.consts'
import { TokenAddressType } from 'providers/TokensProvider/tokens.provider.types'
import { CreateVaultPopupDataType } from 'providers/LoansProvider/helpers/LoansModals.types'

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
}

export type SelectedCollateralsType = Record<
  TokenAddressType,
  { tokenAddress: TokenAddressType; amount: string; validation: InputStatusType }
>

export type FinalBorrowInputDataType = {
  amount: number
  symbol: string
  rate: number
}

// create vault modal context
export type CreateVaultModalState = {
  screenToShow: ScreenType
  vaultInputState: VaultInputState
  selectedCollaterals: SelectedCollateralsType
  selectedCollateralsAddresses: string[]
  isVaultCreating: boolean
  newVault: NewVaultType | null
  hasXTZTokenSelected: string | undefined
  finalBorrowInputData: FinalBorrowInputDataType
}

export type CreateVaultModalContext = CreateVaultModalState &
  CreateNewModalProps & {
    resetCreateVaultModalState: () => void
    updateScreenToShow: (screenId: ScreenType) => void
    updateInputVaultState: (vaultData: Partial<VaultInputState>) => void
    updateVaultCreating: (value: boolean) => void
    updateNewVault: (newVault: NewVaultType) => void
    updateSelectedCollaterals: (selectedCollaterals: SelectedCollateralsType) => void
    setFinalBorrowInputAmount: (args: FinalBorrowInputDataType) => void
    collateralsBalance: number
    borrowCapacity: number
  }

export type CreateNewModalProps = {
  closePopup: () => void
  show: boolean
  data: CreateVaultPopupDataType
}
