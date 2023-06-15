import {ContractMethod, Estimate, TezosOperationError, Wallet} from '@taquito/taquito'
import {DAPP_INSTANCE} from 'app/App.components/ConnectWallet/ConnectWallet.actions'
import {isTezosContractError} from 'errors/error'
import {CONTRACT_ERROR_CODES} from '../consts/contractErrorCodes'
import {SPECIFIC_CONTRACT_ERROR_CODES} from '../consts/specificErrorCodes'
import {toSentenceCase} from 'utils/toSentenceCase'
import {ContractErrorPayload} from '../contractError.type'
import {DEFAULT_TEZOS_ERROR} from '../contractError.const'

export const getContractErrorMessage = (e: unknown): ContractErrorPayload => {
    const isTezosError = isTezosContractError(e)
    console.log(isTezosError, 'isTezosError')
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

interface EstimatedOperation {
    gasLimit: number,
    minimalFeeMutez: number,
    storageLimit: number,
    suggestedFeeMutez: number,
    totalCost: number,
    usingBaseFeeMutez: number
    error?: ContractErrorPayload
}

export const estimateExecution = async (
    tezosOperation: ContractMethod<Wallet>,
): Promise<EstimatedOperation> => {
    let estimatedOperation: EstimatedOperation = {
        gasLimit: 0,
        minimalFeeMutez: 0,
        storageLimit: 0,
        suggestedFeeMutez: 0,
        totalCost: 0,
        usingBaseFeeMutez: 0
    }
    try {
        const tezos = await DAPP_INSTANCE.tezos()
        estimatedOperation = await tezos?.estimate.transfer(tezosOperation.toTransferParams())
        return estimatedOperation
    } catch (e) {
        estimatedOperation.error = getContractErrorMessage(e)
        return estimatedOperation
    }
}

interface EstimatedBatchCall {
    batchOperations?: EstimatedOperation[]
    totalGasLimit: number
    totalCost: number
    totalMinimalFeeMutez: number
    totalSuggestedFeeMutez: number
    error?: ContractErrorPayload
}

export const estimateBatchOperation = async (
    tezosBatchOperation: any,
): Promise<EstimatedBatchCall> => {
    const estimatedBatchCalls: EstimatedBatchCall = {
        totalGasLimit: 0,
        totalCost: 0,
        totalMinimalFeeMutez: 0,
        totalSuggestedFeeMutez: 0
    }
    try {
        const tezos = await DAPP_INSTANCE.tezos()
        const batchOpEstimate = await tezos?.estimate.batch(tezosBatchOperation)
        //TODO: Alex, feel free to change how this works. We want to keep these data points for the future. We will need
        // them for some of the estimate ops we are doing
        batchOpEstimate.forEach((estimate: Estimate) => {
            estimatedBatchCalls.batchOperations?.push(estimate)
            estimatedBatchCalls.totalGasLimit += estimate.gasLimit
            estimatedBatchCalls.totalCost += estimate.totalCost
            estimatedBatchCalls.totalMinimalFeeMutez += estimate.minimalFeeMutez
            estimatedBatchCalls.totalSuggestedFeeMutez += estimate.suggestedFeeMutez
        })
        return estimatedBatchCalls
    } catch (e) {
        console.log(e)
        estimatedBatchCalls.error = getContractErrorMessage(e)
        return estimatedBatchCalls
    }
}
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
