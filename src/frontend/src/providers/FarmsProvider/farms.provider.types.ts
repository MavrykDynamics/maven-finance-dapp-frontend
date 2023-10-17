// types
import { ModalStateType } from 'providers/LoansProvider/helpers/LoansModals.types'
import FarmsPopupsProvider from './farmsPopups.provider'

// consts
import {
  FARMS_LIVE_STAKED_DATA_SUB,
  FARMS_FINISHED_STAKED_DATA_SUB,
  FARMS_DATA_SUB,
  FARMS_ALL_LIVE_DATA_SUB,
  DEPOSIT_TO_FARM_ACTION,
  HARVEST_FARM_REWARDS_ACTION,
  WITHDRAW_FROM_FARM_ACTION,
  FARMS_ALL_FINISHED_DATA_SUB,
} from './helpers/farms.const'

// utils
import { normalizeFarm } from './helpers/farms.normalizer'
import {
  FarmsAllFinishedQueryQuery,
  FarmsAllLiveQueryQuery,
  FarmsStakedFinishedQueryQuery,
  FarmsStakedLiveQueryQuery,
} from 'utils/__generated__/graphql'

// farms general
export type FarmDepositorType = {
  address: string
  participationRewardsPerShare: number
  depositedAmount: number
}
export type FarmRecordType = ReturnType<typeof normalizeFarm>
export type FarmsIndexerDataType =
  | FarmsAllFinishedQueryQuery
  | FarmsAllLiveQueryQuery
  | FarmsStakedFinishedQueryQuery
  | FarmsStakedLiveQueryQuery

// farms actions
export type FarmActionsType =
  | typeof HARVEST_FARM_REWARDS_ACTION
  | typeof DEPOSIT_TO_FARM_ACTION
  | typeof WITHDRAW_FROM_FARM_ACTION

// farms subs
export type FarmsProviderSubsType = {
  [FARMS_DATA_SUB]:
    | typeof FARMS_ALL_LIVE_DATA_SUB
    | typeof FARMS_LIVE_STAKED_DATA_SUB
    | typeof FARMS_ALL_FINISHED_DATA_SUB
    | typeof FARMS_FINISHED_STAKED_DATA_SUB
    | null
}

// farms context
export type FarmCtxStateType = {
  farmsMapper: Record<string, FarmRecordType>
  allLiveFarms: Array<string>
  liveStakedFarms: Array<string>
  allFinishedFarms: Array<string>
  finishedStakedFarms: Array<string>
}

export type NullableFarmCtxStateType = DeepNullable<FarmCtxStateType>

export type FarmsCtxType = FarmCtxStateType & {
  isLoading: boolean

  changeFarmsSubscriptionList: (newSkips: Partial<FarmsProviderSubsType>) => void
}

// farms popups context
export type RoiCalculatorPopupDataType = { selectedFarmAddress: string }
export type FarmWithdrawPopupDataType = { selectedFarmAddress: string }
export type FarmDepositPopupDataType = { selectedFarmAddress: string }

// TODO: in future implement ROI
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
