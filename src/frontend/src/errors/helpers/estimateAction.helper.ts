import { ContractMethod, OpKind, SendParams, MavrykToolkit, TransferParams, Wallet } from '@mavrykdynamics/taquito'
import { ActionErrorReturnType, ActionSuccessReturnType } from 'providers/DappConfigProvider/dappConfig.provider.types'
import { WalletOperationError, checkWhetherWalletAbortError } from 'errors/error'
import { getContractErrorMessage } from './walletError.helper'

type EstimationResultParams = {
  callback?: () => void
  params?: Partial<SendParams>
}

// WHile estimation logic is comented, use this function to hanlde tezos wallet errors
function handleErrorWhenEstimationLogicIsDisabled(e: unknown) {
  const rawError: any = e

  if (checkWhetherWalletAbortError(rawError))
    return { actionSuccess: false, error: new WalletOperationError('Operation is aborted') }
  else if (rawError.data[1]?.with?.string || rawError.data[1]?.with?.int) {
    const _with = rawError.data[1]?.with
    const withPayload = _with?.string ? _with.string : _with?.int

    return { actionSuccess: false, error: getContractErrorMessage(new Error(withPayload), true) }
  }
  // throw e
  return {
    actionSuccess: false,
    error: {
      message: 'Invalid Transaction',
      description: 'Please review documentation',
    },
  }
}

export async function getEstimationResult(
  metadata: ContractMethod<Wallet>,
  args?: EstimationResultParams,
): Promise<ActionErrorReturnType | ActionSuccessReturnType> {
  // const op = await estimateExecution(metadata, args?.params)

  // if (op?.error) {
  //   return { actionSuccess: false, error: op.error }
  // }
  try {
    const operation = await metadata.send(args?.params)

    args?.callback?.()

    return { actionSuccess: true, operation }
  } catch (e) {
    return handleErrorWhenEstimationLogicIsDisabled(e)
  }
}

export async function getEstimationBatchResult(
  tezos: MavrykToolkit,
  batchArr: (TransferParams & { kind: OpKind.TRANSACTION })[],
  cb?: () => void,
) {
  // const estimateBatchOp = await estimateBatchOperation(batchArr)

  // if (estimateBatchOp.error) {
  //   return { actionSuccess: false, error: estimateBatchOp.error }
  // }
  try {
    const operation = await tezos.wallet.batch(batchArr).send()

    cb?.()

    return { actionSuccess: true, operation }
  } catch (e) {
    return handleErrorWhenEstimationLogicIsDisabled(e)
  }
}
