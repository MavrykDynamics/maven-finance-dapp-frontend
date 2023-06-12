import { FullLoansVaultType } from './vaults.types'
import LoansPopupsProvider from 'providers/LoansProvider/LoansModals.provider'

import { DepositorsFlagType, LoansVaultType } from 'utils/TypesAndInterfaces/Loans'
import { TokenAddressType } from 'providers/TokensProvider/tokens.provider.types'
import { InputStatusType } from 'app/App.components/Input/Input.constants'

// TODO: move it out or don't even use it
export const DEFAULT_LOANS_INPUT_VALUE = {
  amount: '0',
  validationStatus: '' as InputStatusType,
}

// Vaults actions popups data types
export type ConfirmBorrowPopupDataType = {
  vault: LoansVaultType
  inputAmount: number
  DAOFee: number
  scrollToCurrentVault?: () => void
} | null

export type ConfirmRepayPartPopupDataType = {
  vault: LoansVaultType
  inputAmount: number
  scrollToCurrentVault?: () => void
} | null

export type ConfirmRepayFullPopupDataType = {
  vault: LoansVaultType
} | null

export type AddCollateralPopupDataType = {
  vault: LoansVaultType
  collateralTokenAddress: TokenAddressType
} | null

export type AddNewCollateralDataProps = {
  vault: LoansVaultType
} | null

export type WithdrawCollateralPopupDataType = {
  vault: LoansVaultType
  collateralTokenAddress: TokenAddressType
} | null

export type RepayPartPopupDataType = {
  vault: FullLoansVaultType
  scrollToCurrentVault?: () => void
} | null

export type RepayFullPopupDataType = {
  vault: FullLoansVaultType
} | null

export type BorrowPopupDataType = {
  vault: LoansVaultType
  borrowAPR: number
  DAOFee: number
  scrollToCurrentVault?: () => void
} | null

// Liquidity popups data types
export type AddLendingAssetDataType = {
  tokenAddress: TokenAddressType
  lendingAPY: number
  mBalance: number
} | null

export type RemoveLendingAssetDataType = {
  tokenAddress: TokenAddressType
  lendingAPY: number
  mBalance: number
  currentLendedAmount: number
  reserveAmount: number
  availableLiquidity: number
} | null

export type ConfirmAddLendingAssetDataType = {
  tokenAddress: TokenAddressType
  lendingAPY: number
  mBalance: number
  inputAmount: number
} | null

export type ConfirmRemoveLendingAssetDataType = {
  tokenAddress: TokenAddressType
  lendingAPY: number
  mBalance: number
  currentLendedAmount: number
  reserveAmount: number
  availableLiquidity: number
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
  tokenAddress: TokenAddressType
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
  tokenAddress: TokenAddressType
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
