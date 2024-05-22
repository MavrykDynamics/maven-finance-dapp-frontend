import {
  ContractMethod,
  OpKind,
  SendParams,
  TezosOperationError,
  TransferParams,
  Wallet,
} from '@mavrykdynamics/taquito'
import { DAPP_INSTANCE } from 'providers/UserProvider/user.provider'
import { SPECIFIC_CONTRACT_ERROR_CODES } from 'errors/consts/customWalletErrorCodes'
import { DEFAULT_WALLET_ERROR } from 'errors/consts/error.const'
import { CONTRACT_ERROR_CODES } from 'errors/consts/walletErrorCodes'
import { isWalletOperationError } from 'errors/error'
import { EstimatedBatchCall, EstimatedOperation, WalletErrorPayload } from 'errors/error.type'
import { toSentenceCase } from 'utils/toSentenceCase'
import { walletErrorPayload } from 'errors/error.schema'

/**
 * checks is it's wallet error and is yes - gets the error info by that specific code
 * @param e Error instance
 * @param skipValidation temporary solution to show error message by code when estimation operation is off
 * @returns {Message, description} object which contains info from error code
 */
export const getContractErrorMessage = (e: unknown, skipValidation = false): WalletErrorPayload => {
  const isTezosError = skipValidation ? true : isWalletOperationError(e)
  if (isTezosError) {
    const error = e as TezosOperationError
    const errorCode = Number(error.message) ? Number(error.message) : error.message ? error.message : null

    const isNumberKey = typeof errorCode === 'number'
    let _error: WalletErrorPayload = DEFAULT_WALLET_ERROR

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

  return DEFAULT_WALLET_ERROR
}

/**
 * estimates the operation before the actual contract call
 * @param tezosOperation instance of contact method
 * @param args optional params like ({gas: , mumav. amount} etc) which are used in ".send(SendParams)" method
 * @returns estimation info with OR without error
 */
export const estimateExecution = async (
  tezosOperation: ContractMethod<Wallet>,
  args: Partial<SendParams> | undefined,
): Promise<EstimatedOperation> => {
  const defaultEstimatedOperation: EstimatedOperation = {
    gasLimit: 0,
    minimalFeeMumav: 0,
    storageLimit: 0,
    suggestedFeeMumav: 0,
    totalCost: 0,
    usingBaseFeeMumav: 0,
  }
  try {
    const tezos = await DAPP_INSTANCE.tezos()
    const estimatedOperation = await tezos?.estimate.transfer(tezosOperation.toTransferParams(args))
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
 * @param tezosBatchOperation
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
        acc.totalMinimalFeeMutez += estimateData.minimalFeeMumav
        acc.totalSuggestedFeeMutez += estimateData.suggestedFeeMumav
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
 * @param error in most cases it would be object to check data returned by "getContractErrorMessage"
 * @returns boolean
 */
export const isContractErrorPayload = (error: unknown): error is WalletErrorPayload => {
  return walletErrorPayload.safeParse(error).success
}
