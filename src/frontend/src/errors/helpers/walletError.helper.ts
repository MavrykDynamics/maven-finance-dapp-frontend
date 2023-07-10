import { ContractMethod, OpKind, TezosOperationError, TransferParams, Wallet } from '@taquito/taquito'
import { DAPP_INSTANCE } from 'providers/UserProvider/user.provider'
import { SPECIFIC_CONTRACT_ERROR_CODES } from 'errors/consts/customWalletErrorCodes'
import { DEFAULT_TEZOS_ERROR } from 'errors/consts/error.const'
import { CONTRACT_ERROR_CODES } from 'errors/consts/walletErrorCodes'
import { isTezosOperationError } from 'errors/error'
import { EstimatedBatchCall, EstimatedOperation, TezosWalletErrorPayload } from 'errors/error.type'
import { toSentenceCase } from 'utils/toSentenceCase'

/**
 * checks is it's wallet error and is yes - gets the error info by that specific code
 * @param e Error instance
 * @returns {Message, description} object which contains info from error code
 */
export const getContractErrorMessage = (e: unknown): TezosWalletErrorPayload => {
  const isTezosError = isTezosOperationError(e)
  if (isTezosError) {
    const error = e as TezosOperationError
    const errorCode = Number(error.message) ? Number(error.message) : error.message ? error.message : null

    const isNumberKey = typeof errorCode === 'number'
    let _error: TezosWalletErrorPayload = DEFAULT_TEZOS_ERROR

    if (errorCode !== null) {
      if (isNumberKey) {
        _error = { ..._error, ...CONTRACT_ERROR_CODES.get(errorCode) }
      } else {
        _error = { ..._error, ...SPECIFIC_CONTRACT_ERROR_CODES.get(errorCode) }
      }
    }

    _error = { ..._error, description: toSentenceCase(_error.description) }

    return _error
  }

  return DEFAULT_TEZOS_ERROR
}


/**
 * estimates the operation before the actual contract call
 * @param tezosOperation instance of contact method
 * @returns estimation info with OR without error
 */
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


/**
 * estimates the operations before the actual contract calls
 * @param tezosOperation instance of contact method inside array
 * @returns estimation info with OR without error
 */
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
    return { ...defaultEstimatedBatchCalls, error: getContractErrorMessage(e) }
  }
}
/**
 * 
 * @param obj in most cases it would be object to check data returned by "getContractErrorMessage"
 * @returns boolean
 */
export const isContractErrorPayload = (obj: any) => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'message' in obj &&
    'description' in obj &&
    typeof obj.message === 'string' &&
    typeof obj.description === 'string'
  )
}
