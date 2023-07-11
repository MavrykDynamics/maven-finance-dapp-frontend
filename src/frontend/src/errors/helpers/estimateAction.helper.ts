import { ContractMethod, OpKind, SendParams, TezosToolkit, TransferParams, Wallet } from '@taquito/taquito'
import { estimateBatchOperation, estimateExecution } from './walletError.helper'
import { ActionErrorReturnType, ActionSuccessReturnType } from 'providers/DappConfigProvider/dappConfig.provider.types'

export async function getEstimationResult(
  metadata: ContractMethod<Wallet>,
  params?: Partial<SendParams>,
  cb?: () => void,
): Promise<ActionErrorReturnType | ActionSuccessReturnType> {
  const op = await estimateExecution(metadata)

  if (op?.error) {
    return { actionSuccess: false, error: op.error }
  }

  const operation = await metadata.send(params)

  cb?.()

  return { actionSuccess: true, operation }
}

export async function getEstimationBatchResult(
  tezos: TezosToolkit,
  batchArr: (TransferParams & { kind: OpKind.TRANSACTION })[],
  cb?: () => void,
) {
  const estimateBatchOp = await estimateBatchOperation(batchArr)

  if (estimateBatchOp.error) {
    return { actionSuccess: false, error: estimateBatchOp.error }
  }

  const operation = await tezos.wallet.batch(batchArr).send()

  cb?.()

  return { actionSuccess: true, operation }
}
