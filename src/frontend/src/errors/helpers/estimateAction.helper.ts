import { ContractMethod, OpKind, SendParams, TezosToolkit, TransferParams, Wallet } from '@taquito/taquito'
import { ActionErrorReturnType, ActionSuccessReturnType } from 'providers/DappConfigProvider/dappConfig.provider.types'
import { WalletOperationError, checkWhetherWalletAbortError } from 'errors/error'

type EstimationResultParams = {
  callback?: () => void
  params?: Partial<SendParams>
}

export async function getEstimationResult(
  metadata: ContractMethod<Wallet>,
  args?: EstimationResultParams
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
    if (checkWhetherWalletAbortError(e))
      return { actionSuccess: false, error: new WalletOperationError('Operation is aborted') }
    throw e
  }
}

export async function getEstimationBatchResult(
  tezos: TezosToolkit,
  batchArr: (TransferParams & { kind: OpKind.TRANSACTION })[],
  cb?: () => void
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
    if (checkWhetherWalletAbortError(e))
      return { actionSuccess: false, error: new WalletOperationError('Operation is aborted') }
    throw e
  }
}
