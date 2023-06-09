import { ContractMethod, TezosOperationError, Wallet } from '@taquito/taquito'
import { DAPP_INSTANCE } from 'app/App.components/ConnectWallet/ConnectWallet.actions'
import { isTezosContractError } from 'errors/error'
import { CONTRACT_ERROR_CODES } from 'utils/error_codes'
import { toSentenceCase } from 'utils/toSentenceCase'

type ContractErrorPayload = {
  message: string
  description: string
}

const DEFAULT_TEZOS_ERROR = {
  message: 'Something went wrong',
  description: 'Something went wrong, you are not allowed to continue current operation',
}

export const getContractErrorMessage = (e: unknown): ContractErrorPayload => {
  const isTezosError = isTezosContractError(e)

  if (isTezosError) {
    const error = e as TezosOperationError
    const errorCode = Number(error.message) ? Number(error.message) : null
    let _error = errorCode !== null ? CONTRACT_ERROR_CODES.get(errorCode) : null
    if (_error) _error.description = toSentenceCase(_error.description)

    return _error ?? DEFAULT_TEZOS_ERROR
  }

  return DEFAULT_TEZOS_ERROR
}

export const estimateExecution = async (
  tezosOperation: ContractMethod<Wallet>,
): Promise<{ minimalFeeMutez: number; totalCost: number; error?: ContractErrorPayload }> => {
  try {
    const tezos = await DAPP_INSTANCE.tezos()
    // @ts-ignore
    const operationEstimate = await tezos?.estimate.transfer(tezosOperation.toTransferParams())
    return operationEstimate
  } catch (e) {
    return {
      minimalFeeMutez: 0,
      totalCost: 0,
      error: getContractErrorMessage(e),
    }
  }
}
