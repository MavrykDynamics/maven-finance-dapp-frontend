import LoansPopupsProvider from 'providers/LoansProvider/LoansModals.provider'

import { TokenAddressType } from 'providers/TokensProvider/tokens.provider.types'
import { VaultType, DepositorsFlagType } from './vaults.types'

// Vaults actions popups data types
export type ConfirmBorrowPopupDataType = {
  vaultId: number
  tokenAddress: TokenAddressType
  borrowedAmount: number
  collateralBalance: number
  borrowCapacity: number
  inputAmount: number
  DAOFee: number
  callback: () => void
} | null

export type ConfirmRepayPartPopupDataType = {
  inputAmount: number
  vaultId: number
  vaultAddress: string
  tokenAddress: TokenAddressType
  borrowedAmount: number
  collateralBalance: number
  borrowCapacity: number
  totalOutstanding: number
  callback: () => void
} | null

export type ConfirmRepayFullPopupDataType = {
  vaultId: number
  vaultAddress: string
  tokenAddress: TokenAddressType
  borrowedAmount: number
  collateralBalance: number
  borrowCapacity: number
  totalOutstanding: number
  callback: () => void
} | null

export type AddCollateralPopupDataType = {
  vaultAddress: string
  availableLiquidity: number
  borrowedTokenAddress: TokenAddressType
  collateralBalance: number
  borrowCapacity: number
  borrowedAmount: number
  collateralRatio: number
  collateralTokenAddress: TokenAddressType
} | null

export type AddNewCollateralDataProps = {
  vaultAddress: string
  collateralBalance: number
  borrowCapacity: number
  borrowedAmount: number
  collateralRatio: number
  borrowedTokenAddress: TokenAddressType
  availableLiquidity: number
  collateralData: VaultType['collateralData']
} | null

export type WithdrawCollateralPopupDataType = {
  vaultAddress: string
  amountToWitdraw: number
  borrowedAmount: number
  borrowedTokenAddress: TokenAddressType
  collateralBalance: number
  collateralRatio: number
  collateralTokenAddress: TokenAddressType
} | null

export type BorrowPopupDataType = {
  vaultId: number
  tokenAddress: TokenAddressType
  borrowedAmount: number
  collateralBalance: number
  borrowCapacity: number
  collateralRatio: number
  borrowAPR: number
  DAOFee: number
  scrollToCurrentVault: () => void
} | null

export type LiquidateVaultDataType = {
  vaultId: number
  ownerAddress: string
  tokenAddress: TokenAddressType
  collateralBalance: number
  collateralData: VaultType['collateralData']
  liquidationMax: number
  liquidationReward: number
  adminLiquidateFee: number
} | null

// Liquidity popups data types
export type AddLendingAssetDataType = {
  tokenAddress: TokenAddressType
  lendingAPY: number
  mBalance: number
} | null

export type ConfirmAddLendingAssetDataType = {
  tokenAddress: TokenAddressType
  lendingAPY: number
  mBalance: number
  inputAmount: number
  callback: () => void
} | null

export type ConfirmRemoveLendingAssetDataType = {
  tokenAddress: TokenAddressType
  currentLendedAmount: number
  inputAmount: number
  callback: () => void
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
  marketTokenAddress: TokenAddressType
  avaliableLiquidity: number
  setCreatedVaultAddress?: (address: string) => void
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

export type LoansPopupsContextStateType = {
  confirmAddLendingAssetPopup: ModalStateType<ConfirmAddLendingAssetDataType>
  confirmRemoveLendingAssetPopup: ModalStateType<ConfirmRemoveLendingAssetDataType>
  confirmRepayPartPopup: ModalStateType<ConfirmRepayPartPopupDataType>
  confirmRepayFullPopup: ModalStateType<ConfirmRepayFullPopupDataType>
  confirmBorrowAssetPopup: ModalStateType<ConfirmBorrowPopupDataType>
  changeBakerPopup: ModalStateType<ChangeBakerPopupDataType>
  borrowAssetPopup: ModalStateType<BorrowPopupDataType>
  addExistingCollateralPopup: ModalStateType<AddCollateralPopupDataType>
  addNewCollateralPopup: ModalStateType<AddNewCollateralDataProps>
  withdrawCollateralPopup: ModalStateType<WithdrawCollateralPopupDataType>
  updateMvkOperatorPopup: ModalStateType<UpdateOperatorsPopupDataType>
  managePermissionsPopup: ModalStateType<ManagePermissionsPopupDataType>
  changeVaultNamePopup: ModalStateType<ChangeVaultNamePopupDataType>
  createVaultPopup: ModalStateType<CreateVaultPopupDataType>
  addLendingAssetPopup: ModalStateType<AddLendingAssetDataType>
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
  borrowAssetPopup: DEFAULT_LOANS_POPUP_STATE,
  addExistingCollateralPopup: DEFAULT_LOANS_POPUP_STATE,
  addNewCollateralPopup: DEFAULT_LOANS_POPUP_STATE,
  withdrawCollateralPopup: DEFAULT_LOANS_POPUP_STATE,
  updateMvkOperatorPopup: DEFAULT_LOANS_POPUP_STATE,
  managePermissionsPopup: DEFAULT_LOANS_POPUP_STATE,
  changeVaultNamePopup: DEFAULT_LOANS_POPUP_STATE,
  createVaultPopup: DEFAULT_LOANS_POPUP_STATE,
  addLendingAssetPopup: DEFAULT_LOANS_POPUP_STATE,
  liquidateVaultPopup: DEFAULT_LOANS_POPUP_STATE,
}
