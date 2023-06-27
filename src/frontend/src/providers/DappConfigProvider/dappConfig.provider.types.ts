import { TransactionWalletOperation } from '@taquito/taquito'
import { BatchWalletOperation } from '@taquito/taquito/dist/types/wallet/batch-operation'
import { StakeActionType } from 'providers/StakeProvider/stake.provider.types'

export type DappConfigContext = {
  // data
  currentIndexedLevel: number | null
  isLoading: boolean

  // methods
  setAction: (actionName: null | UserActionType) => void
}

// TODO: dont forget to add other action names with their transfer to context
export type UserActionType = {
  actionName: StakeActionType
  toasterId: string
  operationLvl: number
}

export type ActionErrorReturnType = { actionSuccess: boolean; error: null | unknown }
export type ActionSuccessReturnType = {
  actionSuccess: boolean
  operation: TransactionWalletOperation | BatchWalletOperation
}
