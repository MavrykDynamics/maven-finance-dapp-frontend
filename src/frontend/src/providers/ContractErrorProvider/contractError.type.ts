import ContractErrorClass from './contractError.provider'
import { STAKING_FIELD } from './contractError.const'

export type ContractErrorPayload = {
  message: string
  description: string
}

export type ContractErrors = {
  [STAKING_FIELD]: ContractErrorPayload | null
  //   add more here, like satellite, governance, dashboard etc
}

export type ContractErrorContextType = {
  errors: ContractErrors
  addContractError: InstanceType<typeof ContractErrorClass>['addContractError']
  removeContractError: InstanceType<typeof ContractErrorClass>['removeContractError']
}

export type Props = {
  children: React.ReactNode
}

export type State = {
  context: ContractErrorContextType
}

// estimate & bathch operations
export type EstimatedOperation = {
  gasLimit: number
  minimalFeeMutez: number
  storageLimit: number
  suggestedFeeMutez: number
  totalCost: number
  usingBaseFeeMutez: number
  error?: ContractErrorPayload
}

export type EstimatedBatchCall = {
  batchOperations?: EstimatedOperation[]
  totalGasLimit: number
  totalCost: number
  totalMinimalFeeMutez: number
  totalSuggestedFeeMutez: number
  error?: ContractErrorPayload
}
