import { InputStatusType } from 'app/App.components/Input/Input.constants'
import { BorrowingData } from 'utils/TypesAndInterfaces/Loans'

export type LoansPopupsInputStateType = { amount: string; validationStatus: InputStatusType }
export const DEFAULT_LOANS_INPUT_VALUE: LoansPopupsInputStateType = {
  amount: '0',
  validationStatus: '',
}

export const getOnBlurValue = (inputValue: string) => (inputValue === '' ? '0' : inputValue)
export const getOnFocusValue = (inputValue: string) => (inputValue === '0' ? '' : inputValue)

export type WithdrawCollateralPopupDataType = {
  vaultAddress: string
  currentCollateralValue: number
  currentAvaliableToWithdraw: number
  selectedAsset?: BorrowingData['collateralData'][number]
} | null

export type RepayPartPopupDataType = {
  vaultAddress: string
  borrowedAsset: BorrowingData['borrowedAsset']
  feesAmount: number
  totalOutstanding: number
  currentCollateralBalance: number
  currentAvaliableToBorrow: number
} | null

export type RepayFullPopupDataType = {
  vaultAddress: string
  borrowedAsset: BorrowingData['borrowedAsset']
  feesAmount: number
  totalOutstanding: number
  currentCollateralBalance: number
  currentAvaliableToBorrow: number
} | null

export type BorrowPopupDataType = {
  vaultAddress: string
  borrowedAsset: BorrowingData['borrowedAsset']
  borowCapacity: number
  collateralUtilization: number
  borrowAPR: number
  hasUserBorrowed: boolean
  currentCollateralBalance: number
  currentAvaliableToBorrow: number
} | null

export type AddCollateralPopupDataType = {
  vaultAddress: string
  currentCollateralValue: number
  currentAvaliableToWithdraw: number
  selectedAsset?: BorrowingData['collateralData'][number]
} | null

export type AddLendingAssetDataType = {
  userBalance: number
  mBalance: number
  lendingAPY: number
  assetRate: number
  assetName: string
  assetIcon?: string
}

export type RemoveLendingAssetDataType = AddLendingAssetDataType & {
  currentLendedAmount: number
}

export type AddNewCollateralDataProps = {
  vaultAddress: string
  currentCollateralValue: number
  currentAvaliableToWithdraw: number
} | null

export type ChangeBakerPopupDataType = {
  bakerAddress: string | null
} | null
