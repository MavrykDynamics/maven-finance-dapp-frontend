import LoansPopupsProvider from 'providers/LoansProvider/LoansModals.provider'

import { InputStatusType } from 'app/App.components/Input/Input.constants'
import { CollateralType, DepositorsFlagType, LoansVaultType } from 'utils/TypesAndInterfaces/Loans'
import { TokenAddress } from 'providers/TokensProvider/tokens.provider.types'

// TODO: move types to loansPopups.types.ts in LoansProvider/
// TODO: move consts & helpers to loansPopups.utils | const.ts in LoansProvider/
export type LoansPopupsInputStateType = { amount: string; validationStatus: InputStatusType }
export type VaultNameInputStateType = { name: string; validationStatus: InputStatusType; errorMessage: string }
export type LoansPopupsAddressInputStateType = { address: string; validationStatus: InputStatusType }
export const DEFAULT_LOANS_INPUT_VALUE: LoansPopupsInputStateType = {
  amount: '0',
  validationStatus: '',
}

export const getOnBlurValue = (inputValue: string) => (inputValue === '' ? '0' : inputValue)
export const getOnFocusValue = (inputValue: string) => (inputValue === '0' ? '' : inputValue)

// Vaults actions popups data types
export type ConfirmBorrowPopupDataType = {
  inputAmount: number
  vaultId: number
  tokenAddress: TokenAddress
  borrowCapacity: number
  currentCollateralBalance: number
  DAOFee: number
  currentBorrowedAmount: number
  scrollToCurrentVault?: () => void
} | null

export type ConfirmRepayPartPopupDataType = {
  vaultId: number
  vaultAddress: string
  tokenAddress: TokenAddress
  borrowedAmount: number
  currentCollateralBalance: number
  borrowCapacity: number
  inputAmount: number
  scrollToCurrentVault?: () => void
} | null

export type ConfirmRepayFullPopupDataType = {
  vaultId: number
  vaultAddress: string
  tokenAddress: TokenAddress
  feesAmount: number
  borrowedAmount: number
  currentCollateralBalance: number
  borrowCapacity: number
} | null

export type CollateralPopupCommonDataType = {
  vaultAddress: string
  vaultCollateralBalance: number
  selectedAsset?: LoansVaultType['collateralData'][number]
  currentCollateralRatio: number
  borrowedAmount: number
  borrowedAssetRate: number
}

export type AddCollateralPopupDataType = {
  vaultAddress: string
  vaultCollateralBalance: number
  selectedAsset?: LoansVaultType['collateralData'][number]
  currentCollateralRatio: number
  borrowedAmount: number
  borrowedAssetRate: number
  borrowCapacity: number
  availableLiquidity: number
} | null

export type AddNewCollateralDataProps = {
  vaultAddress: string
  vaultCollateralBalance: number
  selectedAsset?: LoansVaultType['collateralData'][number]
  currentCollateralRatio: number
  borrowedAmount: number
  borrowedAssetRate: number
  existingCollaterals: Array<CollateralType>
  borrowCapacity: number
  availableLiquidity: number
} | null

export type WithdrawCollateralPopupDataType = {
  vaultAddress: string
  vaultCollateralBalance: number
  selectedAsset?: LoansVaultType['collateralData'][number]
  currentCollateralRatio: number
  borrowedAmount: number
  borrowedAssetRate: number
  currentCollateralBalance: number
} | null

export type RepayPartPopupDataType = {
  vaultId: number
  vaultAddress: string
  tokenAddress: TokenAddress
  feesAmount: number
  borrowedAmount: number
  minimumRepay: number
  currentCollateralBalance: number
  borrowCapacity: number
  scrollToCurrentVault?: () => void
} | null

export type RepayFullPopupDataType = {
  vaultId: number
  vaultAddress: string
  tokenAddress: TokenAddress
  feesAmount: number
  borrowedAmount: number
  minimumRepay: number
  currentCollateralBalance: number
  borrowCapacity: number
  collateralRatio: number
} | null

export type BorrowPopupDataType = {
  vaultId: number
  tokenAddress: TokenAddress
  borrowCapacity: number
  collateralRatio: number
  borrowAPR: number
  hasUserBorrowed: boolean
  currentCollateralBalance: number
  DAOFee: number
  currentBorrowedAmount: number
  scrollToCurrentVault?: () => void
} | null

// Liquidity popups data types
export type AddLendingAssetDataType = {
  tokenAddress: TokenAddress
  lendingAPY: number
  mBalance: number
} | null

export type RemoveLendingAssetDataType = {
  tokenAddress: TokenAddress
  lendingAPY: number
  mBalance: number
  currentLendedAmount: number
  reserveAmount: number
  availableLiquidity: number
} | null

export type ConfirmAddLendingAssetDataType = {
  tokenAddress: TokenAddress
  lendingAPY: number
  mBalance: number
  inputAmount: number
} | null

export type ConfirmRemoveLendingAssetDataType = {
  tokenAddress: TokenAddress
  lendingAPY: number
  mBalance: number
  inputAmount: number
} | null

// Vaults manage popups data types
export type ChangeBakerPopupDataType = {
  bakerAddress: string | null
  vaultAddress: string
} | null

export type ChangeVaultNamePopupDataType = {
  vaultName: string
  vaultAddress: string
} | null

export type CreateVaultPopupDataType = {
  tokenAddress: TokenAddress
  setCreatedVaultAddress?: (address: string) => void
  showShortFlow?: boolean
} | null

export type ManagePermissionsPopupDataType = {
  vaultAddress: string
  depositors: Array<string>
  deporsitorsFlag: DepositorsFlagType
} | null
export type UpdateOperatorsPopupDataType = {
  vaultAddress: string
  tokenAddress: TokenAddress
  operators: string[]
} | null

export type ModalStateType<T = {}> = {
  showModal: boolean
  data: T
}

export type LiquidateVaultDataType = LoansVaultType | null

export type LoansPopupsContextStateType = {
  confirmAddLendingAssetPopup: ModalStateType<ConfirmAddLendingAssetDataType>
  confirmRemoveLendingAssetPopup: ModalStateType<ConfirmRemoveLendingAssetDataType>
  confirmRepayPartPopup: ModalStateType<ConfirmRepayPartPopupDataType>
  confirmRepayFullPopup: ModalStateType<ConfirmRepayFullPopupDataType>
  confirmBorrowAssetPopup: ModalStateType<ConfirmBorrowPopupDataType>
  changeBakerPopup: ModalStateType<ChangeBakerPopupDataType>
  repayPartPopup: ModalStateType<RepayPartPopupDataType>
  repayFullPopup: ModalStateType<RepayFullPopupDataType>
  borrowAssetPopup: ModalStateType<BorrowPopupDataType>
  addExistingCollateralPopup: ModalStateType<AddCollateralPopupDataType>
  addNewCollateralPopup: ModalStateType<AddNewCollateralDataProps>
  withdrawCollateralPopup: ModalStateType<WithdrawCollateralPopupDataType>
  updateMvkOperatorPopup: ModalStateType<UpdateOperatorsPopupDataType>
  managePermissionsPopup: ModalStateType<ManagePermissionsPopupDataType>
  changeVaultNamePopup: ModalStateType<ChangeVaultNamePopupDataType>
  createVaultPopup: ModalStateType<CreateVaultPopupDataType>
  addLendingAssetPopup: ModalStateType<AddLendingAssetDataType>
  removeLendingAssetPopup: ModalStateType<RemoveLendingAssetDataType>
  liquidateVaultPopup: ModalStateType<LiquidateVaultDataType>

  openConfirmAddLendingAssetPopup: InstanceType<typeof LoansPopupsProvider>['openConfirmAddLendingAssetPopup']
  closeConfirmAddLendingAssetPopup: InstanceType<typeof LoansPopupsProvider>['closeConfirmAddLendingAssetPopup']
  openConfirmRemoveLendingAssetPopup: InstanceType<typeof LoansPopupsProvider>['openConfirmRemoveLendingAssetPopup']
  closeConfirmRemoveLendingAssetPopup: InstanceType<typeof LoansPopupsProvider>['closeConfirmRemoveLendingAssetPopup']
  openConfirmBorrowPopup: InstanceType<typeof LoansPopupsProvider>['openConfirmBorrowPopup']
  closeConfirmBorrowPopup: InstanceType<typeof LoansPopupsProvider>['closeConfirmBorrowPopup']
  openConfirmRepayPopup: InstanceType<typeof LoansPopupsProvider>['openConfirmRepayPopup']
  closeConfirmRepayPopup: InstanceType<typeof LoansPopupsProvider>['closeConfirmRepayPopup']
  openConfirmRepayFullPopup: InstanceType<typeof LoansPopupsProvider>['openConfirmRepayFullPopup']
  closeConfirmRepayFullPopup: InstanceType<typeof LoansPopupsProvider>['closeConfirmRepayFullPopup']
  openChangeBakerPopup: InstanceType<typeof LoansPopupsProvider>['openChangeBakerPopup']
  closeChangeBakerPopup: InstanceType<typeof LoansPopupsProvider>['closeChangeBakerPopup']
  openBorrowPopup: InstanceType<typeof LoansPopupsProvider>['openBorrowPopup']
  closeBorrowPopup: InstanceType<typeof LoansPopupsProvider>['closeBorrowPopup']
  openRepayPopup: InstanceType<typeof LoansPopupsProvider>['openRepayPopup']
  closeRepayPopup: InstanceType<typeof LoansPopupsProvider>['closeRepayPopup']
  openRepayFullPopup: InstanceType<typeof LoansPopupsProvider>['openRepayFullPopup']
  closeRepayFullPopup: InstanceType<typeof LoansPopupsProvider>['closeRepayFullPopup']
  openWithdrawCollateralPopup: InstanceType<typeof LoansPopupsProvider>['openWithdrawCollateralPopup']
  closeWithdrawCollateralPopup: InstanceType<typeof LoansPopupsProvider>['closeWithdrawCollateralPopup']
  openAddExistingCollateralPopup: InstanceType<typeof LoansPopupsProvider>['openAddExistingCollateralPopup']
  closeAddExistingCollateralPopup: InstanceType<typeof LoansPopupsProvider>['closeAddExistingCollateralPopup']
  openAddNewCollateralPopup: InstanceType<typeof LoansPopupsProvider>['openAddNewCollateralPopup']
  closeAddNewCollateralPopup: InstanceType<typeof LoansPopupsProvider>['closeAddNewCollateralPopup']
  openUpdateMvkOperatorsPopup: InstanceType<typeof LoansPopupsProvider>['openUpdateMvkOperatorsPopup']
  closeUpdateMvkOperatorsPopup: InstanceType<typeof LoansPopupsProvider>['closeUpdateMvkOperatorsPopup']
  openManagePermissionsPopup: InstanceType<typeof LoansPopupsProvider>['openManagePermissionsPopup']
  closeManagePermissionsPopup: InstanceType<typeof LoansPopupsProvider>['closeManagePermissionsPopup']
  openChangeVaultNamePopup: InstanceType<typeof LoansPopupsProvider>['openChangeVaultNamePopup']
  closeChangeVaultNamePopup: InstanceType<typeof LoansPopupsProvider>['closeChangeVaultNamePopup']
  openCreateVaultPopup: InstanceType<typeof LoansPopupsProvider>['openCreateVaultPopup']
  closeCreateVaultPopup: InstanceType<typeof LoansPopupsProvider>['closeCreateVaultPopup']
  openAddLendingAssetPopup: InstanceType<typeof LoansPopupsProvider>['openAddLendingAssetPopup']
  closeAddLendingAssetPopup: InstanceType<typeof LoansPopupsProvider>['closeAddLendingAssetPopup']
  openRemoveLendingAssetPopup: InstanceType<typeof LoansPopupsProvider>['openRemoveLendingAssetPopup']
  closeRemoveLendingAssetPopup: InstanceType<typeof LoansPopupsProvider>['closeRemoveLendingAssetPopup']
  openLiquidateVaultPopup: InstanceType<typeof LoansPopupsProvider>['openLiquidateVaultPopup']
  closeLiquidateVaultPopup: InstanceType<typeof LoansPopupsProvider>['closeLiquidateVaultPopup']
}

const DEFAULT_LOANS_POPUP_STATE = {
  showModal: false,
  data: null,
}

export const DEFAULT_LOANS_POPUPS_STATE = {
  confirmAddLendingAssetPopup: DEFAULT_LOANS_POPUP_STATE,
  confirmRemoveLendingAssetPopup: DEFAULT_LOANS_POPUP_STATE,
  confirmRepayPartPopup: DEFAULT_LOANS_POPUP_STATE,
  confirmRepayFullPopup: DEFAULT_LOANS_POPUP_STATE,
  confirmBorrowAssetPopup: DEFAULT_LOANS_POPUP_STATE,
  changeBakerPopup: DEFAULT_LOANS_POPUP_STATE,
  repayPartPopup: DEFAULT_LOANS_POPUP_STATE,
  repayFullPopup: DEFAULT_LOANS_POPUP_STATE,
  borrowAssetPopup: DEFAULT_LOANS_POPUP_STATE,
  addExistingCollateralPopup: DEFAULT_LOANS_POPUP_STATE,
  addNewCollateralPopup: DEFAULT_LOANS_POPUP_STATE,
  withdrawCollateralPopup: DEFAULT_LOANS_POPUP_STATE,
  updateMvkOperatorPopup: DEFAULT_LOANS_POPUP_STATE,
  managePermissionsPopup: DEFAULT_LOANS_POPUP_STATE,
  changeVaultNamePopup: DEFAULT_LOANS_POPUP_STATE,
  createVaultPopup: DEFAULT_LOANS_POPUP_STATE,
  addLendingAssetPopup: DEFAULT_LOANS_POPUP_STATE,
  removeLendingAssetPopup: DEFAULT_LOANS_POPUP_STATE,
  liquidateVaultPopup: DEFAULT_LOANS_POPUP_STATE,
}
