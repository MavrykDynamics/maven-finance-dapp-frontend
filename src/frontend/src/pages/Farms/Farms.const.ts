import { ModalStateType } from 'providers/LoansProvider/helpers/LoansModals.types'
import FarmsPopupsProvider from './FarmsPopups/FarmsPopups.provider'

export const LIVE_TAB_ID = 1
export const FINISHED_TAB_ID = 2
export type isLiveFarmType = typeof LIVE_TAB_ID | typeof FINISHED_TAB_ID

export const VERTICAL_FARM_VIEW = 'vertical'
export const HORIZONTAL_FARM_VIEW = 'horizontal'
export type FarmsViewVariantType = typeof VERTICAL_FARM_VIEW | typeof HORIZONTAL_FARM_VIEW

export const STAKED = 1
export const NO_STAKED = 0
export type isStakedFarmType = typeof STAKED | typeof NO_STAKED

export const itemsForFarmsSortDD = [
  { content: 'Active', id: 'active' },
  { content: 'Highest APY', id: 'highestAPY' },
  { content: 'Lowest APY', id: 'lowestAPY' },
  { content: 'Highest Liquidity (LPBalance)', id: 'highestLiquidity' },
  { content: 'Lowest Liquidity (LPBalance)', id: 'lowestLiquidity' },
  { content: 'Your Largest Stake', id: 'yourLargestStake' },
  { content: 'Rewards Per Block', id: 'rewardsPerBlock' },
]

export type FarmsFiltersStateType = {
  isStaked: isStakedFarmType
  openedFarmsCards: Array<string>
  isLive: isLiveFarmType
  searchValue: string
  sortBy: string
  farmsViewVariant: FarmsViewVariantType
}

export type RoiCalculatorPopupDataType = { selectedFarmAddress: string }
export type FarmWithdrawPopupDataType = { selectedFarmAddress: string }
export type FarmDepositPopupDataType = { selectedFarmAddress: string }

export type FarmsPopupsContextStateType = {
  // roiPopup: ModalStateType<RoiCalculatorPopupDataType>
  depositPopup: ModalStateType<FarmDepositPopupDataType>
  withdrawPopup: ModalStateType<FarmWithdrawPopupDataType>

  // openRoiCalculatorPopup: InstanceType<typeof FarmsPopupsProvider>['openRoiCalculatorPopup']
  // closeRoiCalculatorPopup: InstanceType<typeof FarmsPopupsProvider>['closeRoiCalculatorPopup']
  openDepositFarmPopup: InstanceType<typeof FarmsPopupsProvider>['openDepositFarmPopup']
  closeDepositFarmPopup: InstanceType<typeof FarmsPopupsProvider>['closeDepositFarmPopup']
  openWithdrawFarmPopup: InstanceType<typeof FarmsPopupsProvider>['openWithdrawFarmPopup']
  closeWithdrawFarmPopup: InstanceType<typeof FarmsPopupsProvider>['closeWithdrawFarmPopup']
}

export const DEFAULT_FARMS_POPUPS_STATE = {
  // roiPopup: DEFAULT_FARMS_POPUP_STATE,
  depositPopup: {
    showModal: false,
    data: {
      selectedFarmAddress: '',
    },
  },
  withdrawPopup: {
    showModal: false,
    data: {
      selectedFarmAddress: '',
    },
  },
}
