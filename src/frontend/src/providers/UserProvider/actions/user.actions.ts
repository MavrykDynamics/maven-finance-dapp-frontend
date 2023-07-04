import { OpKind, TransferParams, WalletParamsWithKind } from '@taquito/taquito'
import { DAPP_INSTANCE } from 'app/App.components/ConnectWallet/ConnectWallet.actions'
import { unknownToError } from 'errors/error'
import { estimateBatchOperation, estimateExecution } from 'errors/helpers/walletError.helper'
import { ActionErrorReturnType, ActionSuccessReturnType } from 'providers/DappConfigProvider/dappConfig.provider.types'

export const claimVestingReward = async (
  vestingAddress: string,
): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos?.wallet.at(vestingAddress)
    const claimVestinOperationMetaData = contract?.methods.claim()

    const op = await estimateExecution(claimVestinOperationMetaData)

    if (op?.error) {
      return { actionSuccess: false, error: op.error }
    }

    const operation = await claimVestinOperationMetaData.send()

    return { actionSuccess: true, operation }
  } catch (error) {
    return { actionSuccess: false, error: unknownToError(error) }
  }
}

export const claimAllRewardsAction = async (userAddress: string, doormanAddress: string) => {
  try {
    // update it to be from args after moving to context
    const availableDoormanRewards = 0,
      availableFarmRewards = {} as any,
      availableSatellitesRewards = 0
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    // if user has farm rewards to claim it will transfrom this rewards to batch call getting rewards array
    const farmsRewardsBatchPart = await Promise.all(
      Object.keys(availableFarmRewards)
        .reduce<Array<() => Promise<WalletParamsWithKind>>>((callbacks, farmAddress) => {
          if (availableFarmRewards[farmAddress].myAvailableFarmRewards > 0) {
            callbacks.push(async () => {
              const farmContractInstance = await tezos?.wallet.at(farmAddress)

              return {
                kind: OpKind.TRANSACTION,
                ...farmContractInstance.methods.claim(farmAddress).toTransferParams(),
              }
            })
          }

          return callbacks
        }, [])
        .map((fn) => fn()),
    )

    // TODO fix type
    const bachArr = [...farmsRewardsBatchPart] as (TransferParams & { kind: OpKind.TRANSACTION })[]

    // if user has satelite/doorman reward batch part of getting this reward will be added to the batch array
    if (availableDoormanRewards > 0 || availableSatellitesRewards > 0) {
      const doormanContractInstance = await tezos?.wallet.at(doormanAddress)
      bachArr.push({
        kind: OpKind.TRANSACTION,
        ...doormanContractInstance.methods.compound(userAddress).toTransferParams(),
      })
    }

    const estimateBatchOp = await estimateBatchOperation(bachArr)

    if (estimateBatchOp.error) {
      return { actionSuccess: false, error: estimateBatchOp.error }
    }

    const operation = await tezos.wallet.batch(bachArr).send()

    return { actionSuccess: true, operation }
  } catch (error) {
    return { actionSuccess: false, error: unknownToError(error) }
  }
}
