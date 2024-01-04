import LoansPopupsProvider from 'providers/LoansProvider/LoansModals.provider'

import {TokenAddressType} from 'providers/TokensProvider/tokens.provider.types'
import {DepositorsFlagType, VaultType} from '../../VaultsProvider/vaults.provider.types'

// --- confirm borrow popup
export type ConfirmBorrowPopupDataType = {
  vaultId: number
  tokenAddress: TokenAddressType
  collateralBalance: number
  availableLiquidity: number
  inputAmount: number
  totalOutstanding: number
  DAOFee: number
  callback: () => void
}

export const DEFAULT_CONFIRM_BORROW_POPUP_DATA: ConfirmBorrowPopupDataType = {
  tokenAddress: '',
  vaultId: 0,
  availableLiquidity: 0,
  collateralBalance: 0,
  totalOutstanding: 0,
  inputAmount: 0,
  DAOFee: 0,
  callback: () => {},
}

// --- confirm repay popup
export type ConfirmRepayPartPopupDataType = {
  inputAmount: number
  vaultId: number
  vaultAddress: string
  tokenAddress: TokenAddressType
  totalOutstanding: number
  collateralBalance: number
  availableLiquidity: number
  callback: () => void
}

export const DEFAULT_CONFIRM_REPAY_POPUP_DATA: ConfirmRepayPartPopupDataType = {
  vaultAddress: '',
  tokenAddress: '',
  vaultId: 0,
  collateralBalance: 0,
  availableLiquidity: 0,
  inputAmount: 0,
  totalOutstanding: 0,
  callback: () => {},
}

// --- confirm repay full popup
export type ConfirmRepayFullPopupDataType = {
  vaultId: number
  vaultAddress: string
  tokenAddress: TokenAddressType
  borrowedAmount: number
  collateralBalance: number
  availableLiquidity: number
  totalOutstanding: number
  callback: () => void
}

export const DEFAULT_CONFIRM_REPAY_FULL_POPUP_DATA: ConfirmRepayFullPopupDataType = {
  vaultAddress: '',
  tokenAddress: '',
  vaultId: 0,
  collateralBalance: 0,
  availableLiquidity: 0,
  totalOutstanding: 0,
  borrowedAmount: 0,
  callback: () => {},
}

// --- add collateral popup
export type AddCollateralPopupDataType = {
  vaultAddress: string
  vaultId: number
  availableLiquidity: number
  borrowedTokenAddress: TokenAddressType
  collateralBalance: number
  borrowCapacity: number
  currentTotalOutstanding: number
  collateralRatio: number
  collateralTokenAddress: TokenAddressType
}

export const DEFAULT_ADD_COLLATERAL_POPUP_DATA: AddCollateralPopupDataType = {
  vaultAddress: '',
  borrowedTokenAddress: '',
  collateralTokenAddress: '',
  vaultId: 0,
  collateralBalance: 0,
  borrowCapacity: 0,
  currentTotalOutstanding: 0,
  availableLiquidity: 0,
  collateralRatio: 0,
}

// --- add new collateral popup data
export type AddNewCollateralDataProps = {
  vaultAddress: string
  collateralBalance: number
  vaultId: number
  borrowCapacity: number
  currentTotalOutstanding: number
  collateralRatio: number
  borrowedTokenAddress: TokenAddressType
  availableLiquidity: number
  collateralData: VaultType['collateralData']
  xtzDelegatedTo: VaultType['xtzDelegatedTo']
}

export const DEFAULT_ADD_NEW_COLLATERAL_POPUP_DATA: AddNewCollateralDataProps = {
  vaultAddress: '',
  borrowedTokenAddress: '',
  vaultId: 0,
  collateralBalance: 0,
  borrowCapacity: 0,
  currentTotalOutstanding: 0,
  availableLiquidity: 0,
  collateralRatio: 0,
  collateralData: [],
  xtzDelegatedTo: null,
}

// --- add new collateral popup data
export type WithdrawCollateralPopupDataType = {
  vaultAddress: string
  vaultId: number
  borrowedTokenAddress: TokenAddressType
  collateralBalance: number
  selectedCollateralAmountInVault: number
  currentTotalOutstanding: number
  availableLiquidity: number
  collateralRatio: number
  collateralTokenAddress: TokenAddressType
}

export const DEFAULT_WITHDRAW_COLLATERAL_POPUP_DATA: WithdrawCollateralPopupDataType = {
  vaultAddress: '',
  borrowedTokenAddress: '',
  collateralTokenAddress: '',
  vaultId: 0,
  collateralBalance: 0,
  currentTotalOutstanding: 0,
  availableLiquidity: 0,
  collateralRatio: 0,
  selectedCollateralAmountInVault: 0,
}

// --- liquidate vault popup
export type LiquidateVaultDataType = {
  vaultId: number
  ownerAddress: string
  tokenAddress: TokenAddressType
  collateralBalance: number
  collateralData: VaultType['collateralData']
  liquidationMax: number
  liquidationReward: number
  adminLiquidateFee: number
}

export const DEFAULT_LIQUIDATE_POPUP_DATA: LiquidateVaultDataType = {
  tokenAddress: '',
  ownerAddress: '',
  vaultId: 0,
  collateralBalance: 0,
  liquidationMax: 0,
  liquidationReward: 0,
  adminLiquidateFee: 0,
  collateralData: [],
}

// --- add liquidity popup
export type AddLendingAssetDataType = {
  tokenAddress: TokenAddressType
  lendingAPY: number
  mBalance: number
}

export const DEFAULT_ADD_LIQUIDITY_POPUP_DATA: AddLendingAssetDataType = {
  tokenAddress: '',
  lendingAPY: 0,
  mBalance: 0,
}

// --- configm add liquidity popup
export type ConfirmAddLendingAssetDataType = {
  tokenAddress: TokenAddressType
  lendingAPY: number
  mBalance: number
  inputAmount: number
  callback: () => void
}

export const DEFAULT_CONFIRM_ADD_LIQUIDITY_POPUP_DATA: ConfirmAddLendingAssetDataType = {
  tokenAddress: '',
  lendingAPY: 0,
  mBalance: 0,
  inputAmount: 0,
  callback: () => {},
}

// --- confirm remove liquidity popup
export type ConfirmRemoveLendingAssetDataType = {
  tokenAddress: TokenAddressType
  currentLendedAmount: number
  inputAmount: number
  callback: () => void
}

export const DEFAULT_CONFIRM_REMOVE_LIQUIDITY_POPUP_DATA: ConfirmRemoveLendingAssetDataType = {
  tokenAddress: '',
  inputAmount: 0,
  currentLendedAmount: 0,
  callback: () => {},
}

// --- change baker popup
export type ChangeBakerPopupDataType = {
  bakerAddress: string | null
  vaultAddress: string
}

export const DEFAULT_CHANGE_BAKER_POPUP_DATA: ChangeBakerPopupDataType = {
  bakerAddress: null,
  vaultAddress: '',
}

// --- change vault name popup
export type ChangeVaultNamePopupDataType = {
  vaultName: string
  vaultAddress: string
}

export const DEFAULT_CHANGE_NAME_POPUP_DATA: ChangeVaultNamePopupDataType = {
  vaultName: '',
  vaultAddress: '',
}

// --- create vault popup
export type CreateVaultPopupDataType = {
  marketTokenAddress: TokenAddressType
  availableLiquidity: number
  setCreatedVaultAddress?: (address: string) => void
}

export const DEFAULT_CREATE_VAULT_POPUP_DATA: CreateVaultPopupDataType = {
  marketTokenAddress: '',
  availableLiquidity: 0,
  setCreatedVaultAddress: () => {},
}

// --- manage permissions popup
export type ManagePermissionsPopupDataType = {
  vaultAddress: string
  depositors: Array<string>
  depositorsFlag: DepositorsFlagType
}

export const DEFAULT_MANAGE_PERMISSIONS_POPUP_DATA: ManagePermissionsPopupDataType = {
  vaultAddress: '',
  depositorsFlag: 'any',
  depositors: [],
}

// --- update MVN operators popup
export type UpdateOperatorsPopupDataType = {
  vaultAddress: string
  tokenAddress: TokenAddressType
  operators: string[]
}

export const DEFAULT_UPDATE_MVN_OPERATORS_DATA: UpdateOperatorsPopupDataType = {
  vaultAddress: '',
  tokenAddress: '',
  operators: [],
}

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
  addExistingCollateralPopup: ModalStateType<AddCollateralPopupDataType>
  addNewCollateralPopup: ModalStateType<AddNewCollateralDataProps>
  withdrawCollateralPopup: ModalStateType<WithdrawCollateralPopupDataType>
  updateMvnOperatorPopup: ModalStateType<UpdateOperatorsPopupDataType>
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
  openWithdrawCollateralPopup: InstanceType<typeof LoansPopupsProvider>['openWithdrawCollateralPopup']
  closeWithdrawCollateralPopup: InstanceType<typeof LoansPopupsProvider>['closeWithdrawCollateralPopup']
  openAddExistingCollateralPopup: InstanceType<typeof LoansPopupsProvider>['openAddExistingCollateralPopup']
  closeAddExistingCollateralPopup: InstanceType<typeof LoansPopupsProvider>['closeAddExistingCollateralPopup']
  openAddNewCollateralPopup: InstanceType<typeof LoansPopupsProvider>['openAddNewCollateralPopup']
  closeAddNewCollateralPopup: InstanceType<typeof LoansPopupsProvider>['closeAddNewCollateralPopup']
  openUpdateMvnOperatorsPopup: InstanceType<typeof LoansPopupsProvider>['openUpdateMvnOperatorsPopup']
  closeUpdateMvnOperatorsPopup: InstanceType<typeof LoansPopupsProvider>['closeUpdateMvnOperatorsPopup']
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

export const DEFAULT_LOANS_POPUPS_STATE = {
  confirmAddLendingAssetPopup: {
    showModal: false,
    data: DEFAULT_CONFIRM_ADD_LIQUIDITY_POPUP_DATA,
  },
  confirmRemoveLendingAssetPopup: {
    showModal: false,
    data: DEFAULT_CONFIRM_REMOVE_LIQUIDITY_POPUP_DATA,
  },
  confirmRepayPartPopup: {
    showModal: false,
    data: DEFAULT_CONFIRM_REPAY_POPUP_DATA,
  },
  confirmRepayFullPopup: {
    showModal: false,
    data: DEFAULT_CONFIRM_REPAY_FULL_POPUP_DATA,
  },
  confirmBorrowAssetPopup: {
    showModal: false,
    data: DEFAULT_CONFIRM_BORROW_POPUP_DATA,
  },
  changeBakerPopup: {
    showModal: false,
    data: DEFAULT_CHANGE_BAKER_POPUP_DATA,
  },
  addExistingCollateralPopup: {
    showModal: false,
    data: DEFAULT_ADD_COLLATERAL_POPUP_DATA,
  },
  addNewCollateralPopup: {
    showModal: false,
    data: DEFAULT_ADD_NEW_COLLATERAL_POPUP_DATA,
  },
  withdrawCollateralPopup: {
    showModal: false,
    data: DEFAULT_WITHDRAW_COLLATERAL_POPUP_DATA,
  },
  updateMvnOperatorPopup: {
    showModal: false,
    data: DEFAULT_UPDATE_MVN_OPERATORS_DATA,
  },
  managePermissionsPopup: {
    showModal: false,
    data: DEFAULT_MANAGE_PERMISSIONS_POPUP_DATA,
  },
  changeVaultNamePopup: {
    showModal: false,
    data: DEFAULT_CHANGE_NAME_POPUP_DATA,
  },
  createVaultPopup: {
    showModal: false,
    data: DEFAULT_CREATE_VAULT_POPUP_DATA,
  },
  addLendingAssetPopup: {
    showModal: false,
    data: DEFAULT_ADD_LIQUIDITY_POPUP_DATA,
  },
  liquidateVaultPopup: {
    showModal: false,
    data: DEFAULT_LIQUIDATE_POPUP_DATA,
  },
}
