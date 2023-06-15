import { ContractMethod, Estimate, OpKind, TezosOperationError, TransferParams, Wallet } from '@taquito/taquito'
import { DAPP_INSTANCE } from 'app/App.components/ConnectWallet/ConnectWallet.actions'
import { isTezosContractError } from 'errors/error'
import { CONTRACT_ERROR_CODES } from '../consts/contractErrorCodes'
import { SPECIFIC_CONTRACT_ERROR_CODES } from '../consts/specificErrorCodes'
import { toSentenceCase } from 'utils/toSentenceCase'
import { ContractErrorPayload, EstimatedBatchCall, EstimatedOperation } from '../contractError.type'
import { DEFAULT_TEZOS_ERROR } from '../contractError.const'

export const getContractErrorMessage = (e: unknown): ContractErrorPayload => {
  const isTezosError = isTezosContractError(e)
  // console.log(isTezosError, 'isTezosError')
  console.log(Object.assign({}, e))
  if (isTezosError) {
    const error = e as TezosOperationError
    const errorCode = Number(error.message) ? Number(error.message) : error.message ? error.message : null

    const isNumberKey = typeof errorCode === 'number'
    let _error = null

    if (errorCode !== null) {
      if (isNumberKey) {
        _error = CONTRACT_ERROR_CODES.get(errorCode)
      } else {
        _error = SPECIFIC_CONTRACT_ERROR_CODES.get(errorCode)
      }
    }

    if (_error) _error.description = toSentenceCase(_error.description)
    return _error ?? DEFAULT_TEZOS_ERROR
  }

  return DEFAULT_TEZOS_ERROR
}

export const estimateExecution = async (tezosOperation: ContractMethod<Wallet>): Promise<EstimatedOperation> => {
  const defaultEstimatedOperation: EstimatedOperation = {
    gasLimit: 0,
    minimalFeeMutez: 0,
    storageLimit: 0,
    suggestedFeeMutez: 0,
    totalCost: 0,
    usingBaseFeeMutez: 0,
  }
  try {
    const tezos = await DAPP_INSTANCE.tezos()
    const estimatedOperation = await tezos?.estimate.transfer(tezosOperation.toTransferParams())
    return { ...defaultEstimatedOperation, ...estimatedOperation }
  } catch (e) {
    return {
      ...defaultEstimatedOperation,
      error: getContractErrorMessage(e),
    }
  }
}

export const estimateBatchOperation = async (
  tezosBatchOperation: (TransferParams & { kind: OpKind.TRANSACTION })[],
): Promise<EstimatedBatchCall> => {
  const defaultEstimatedBatchCalls: EstimatedBatchCall = {
    totalGasLimit: 0,
    totalCost: 0,
    totalMinimalFeeMutez: 0,
    totalSuggestedFeeMutez: 0,
  }
  try {
    const tezos = await DAPP_INSTANCE.tezos()
    const batchOpEstimate = await tezos?.estimate.batch(tezosBatchOperation)
    //We want to keep these data points for the future. We will need
    // them for some of the estimate ops we are doing

    const estimatedBatchCalls = batchOpEstimate.reduce(
      (acc: EstimatedBatchCall, estimateData) => {
        acc.batchOperations?.push(estimateData)
        acc.totalGasLimit += estimateData.gasLimit
        acc.totalCost += estimateData.totalCost
        acc.totalMinimalFeeMutez += estimateData.minimalFeeMutez
        acc.totalSuggestedFeeMutez += estimateData.suggestedFeeMutez
        return acc
      },
      { ...defaultEstimatedBatchCalls },
    )

    return estimatedBatchCalls
  } catch (e) {
    // console.log(Object.assign({}, e, '------------'))
    return { ...defaultEstimatedBatchCalls, error: getContractErrorMessage(e) }
  }
}

export const isContractErrorPayload = (obj: any) => {
  console.log(obj, '_____________________________')

  return (
    typeof obj === 'object' &&
    obj !== null &&
    'message' in obj &&
    'description' in obj &&
    typeof obj.message === 'string' &&
    typeof obj.description === 'string'
  )
}
