import { InputStatusType } from 'app/App.components/Input/Input.constants'
import { CollateralType, LoansAssetDataType, LoansVaultType } from 'utils/TypesAndInterfaces/Loans'
import LoansPopupsProvider from './LoansModals.provider'
import { VaultType } from 'utils/TypesAndInterfaces/Vaults'

export type LoansPopupsInputStateType = { amount: string; validationStatus: InputStatusType }
export type LoansPopupsAddressInputStateType = { address: string; validationStatus: InputStatusType }
export const DEFAULT_LOANS_INPUT_VALUE: LoansPopupsInputStateType = {
  amount: '0',
  validationStatus: '',
}

export const getOnBlurValue = (inputValue: string) => (inputValue === '' ? '0' : inputValue)
export const getOnFocusValue = (inputValue: string) => (inputValue === '0' ? '' : inputValue)

export type CollateralPopupCommonDataType = {
  vaultAddress: string
  vaultCollateralBalance: number
  selectedAsset?: LoansVaultType['collateralData'][number]
  currentCollateralRatio: number
  collateralWithdrawAmount: number
  borrowedAmount: number
  borrowedAssetRate: number
}

export type AddCollateralPopupDataType =
  | (CollateralPopupCommonDataType & {
      bakerAddress: string | null
    })
  | null

export type AddNewCollateralDataProps =
  | (CollateralPopupCommonDataType & {
      existingCollaterals: Array<CollateralType>
    })
  | null

export type WithdrawCollateralPopupDataType =
  | (CollateralPopupCommonDataType & {
      currentCollateralBalance: number
    })
  | null

export type RepayCollateralPopupDataBaseType = {
  vaultId: number
  borrowedAsset: LoansVaultType['borrowedAsset']
  feesAmount: number
  borrowedAmount: number
  currentCollateralBalance: number
  borrowCapacity: number
}

export type RepayPartPopupDataType = RepayCollateralPopupDataBaseType | null

export type RepayFullPopupDataType =
  | (RepayCollateralPopupDataBaseType & {
      collateralRatio: number
    })
  | null

export type BorrowPopupDataType = {
  vaultId: number
  borrowedAsset: LoansVaultType['borrowedAsset']
  borrowCapacity: number
  collateralRatio: number
  borrowAPR: number
  hasUserBorrowed: boolean
  currentCollateralBalance: number
  DAOFee: number
  currentBorrowedAmount: number
} | null

export type AddLendingAssetDataType =
  | (LoansAssetDataType & {
      lendingAPY: number
      mBalance: number
      address: string
    })
  | null

export type RemoveLendingAssetDataType =
  | (AddLendingAssetDataType & {
      currentLendedAmount: number
    })
  | null

export type ChangeBakerPopupDataType = {
  bakerAddress: string | null
  vaultAddress: string
} | null

export type CreateVaultPopupDataType = {
  currentMarketAsset: string
  setCreatedVaultAddress: (address: string) => void
} | null

export type LiquidateVaultDataType = VaultType | null

export type ManagePermissionsPopupDataType = {} | null
export type UpdateOperatorsPopupDataType = {} | null

export type ModalStateType<T = {}> = {
  showModal: boolean
  data: T
}

export type LoansPopupsContextStateType = {
  changeBakerPopup: ModalStateType<ChangeBakerPopupDataType>
  repayPartPopup: ModalStateType<RepayPartPopupDataType>
  repayFullPopup: ModalStateType<RepayFullPopupDataType>
  borrowAssetPopup: ModalStateType<BorrowPopupDataType>
  addExistingCollateralPopup: ModalStateType<AddCollateralPopupDataType>
  addNewCollateralPopup: ModalStateType<AddNewCollateralDataProps>
  withdrawCollateralPopup: ModalStateType<WithdrawCollateralPopupDataType>
  updateMvkOperatorPopup: ModalStateType<UpdateOperatorsPopupDataType>
  managePermissionsPopup: ModalStateType<ManagePermissionsPopupDataType>
  createVaultPopup: ModalStateType<CreateVaultPopupDataType>
  addLendingAssetPopup: ModalStateType<AddLendingAssetDataType>
  removeLendingAssetPopup: ModalStateType<RemoveLendingAssetDataType>
  liquidateVaultPopup: ModalStateType<LiquidateVaultDataType>

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
  changeBakerPopup: DEFAULT_LOANS_POPUP_STATE,
  repayPartPopup: DEFAULT_LOANS_POPUP_STATE,
  repayFullPopup: DEFAULT_LOANS_POPUP_STATE,
  borrowAssetPopup: DEFAULT_LOANS_POPUP_STATE,
  addExistingCollateralPopup: DEFAULT_LOANS_POPUP_STATE,
  addNewCollateralPopup: DEFAULT_LOANS_POPUP_STATE,
  withdrawCollateralPopup: DEFAULT_LOANS_POPUP_STATE,
  updateMvkOperatorPopup: DEFAULT_LOANS_POPUP_STATE,
  managePermissionsPopup: DEFAULT_LOANS_POPUP_STATE,
  createVaultPopup: DEFAULT_LOANS_POPUP_STATE,
  addLendingAssetPopup: DEFAULT_LOANS_POPUP_STATE,
  removeLendingAssetPopup: DEFAULT_LOANS_POPUP_STATE,
  liquidateVaultPopup: DEFAULT_LOANS_POPUP_STATE,
}
