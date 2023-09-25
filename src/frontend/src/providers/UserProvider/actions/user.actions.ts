import { OpKind, TransferParams, WalletParamsWithKind } from '@taquito/taquito'
import { DAPP_INSTANCE } from 'providers/UserProvider/user.provider'
import { WalletOperationError, unknownToError } from 'errors/error'
import { ActionErrorReturnType, ActionSuccessReturnType } from 'providers/DappConfigProvider/dappConfig.provider.types'
import { getEstimationBatchResult, getEstimationResult } from 'errors/helpers/estimateAction.helper'

export const claimVestingReward = async (
  vestingAddress: string,
): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos?.wallet.at(vestingAddress)
    const claimVestinOperationMetaData = contract?.methods.claim()

    return await getEstimationResult(claimVestinOperationMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

export const claimAllRewardsAction = async (
  userAddress: string,
  doormanAddress: string,
  availableDoormanRewards: number,
  availableSatellitesRewards: number,
  availableFarmRewards: Record<string, number>,
): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    // if user has farm rewards to claim it will transfrom this rewards to batch call getting rewards array
    const farmsRewardsBatchPart = await Promise.all(
      Object.keys(availableFarmRewards)
        .reduce<Array<() => Promise<WalletParamsWithKind>>>((callbacks, farmAddress) => {
          if (availableFarmRewards[farmAddress] > 0) {
            callbacks.push(async () => {
              const farmContractInstance = await tezos?.wallet.at(farmAddress)

              return {
                kind: OpKind.TRANSACTION,
                ...farmContractInstance.methods.claim([userAddress]).toTransferParams(),
              }
            })
          }

          return callbacks
        }, [])
        .map((fn) => fn()),
    )

    const batchArr = [...farmsRewardsBatchPart] as (TransferParams & { kind: OpKind.TRANSACTION })[]

    // if user has satelite/doorman reward batch part of getting this reward will be added to the batch array
    if (availableDoormanRewards > 0 || availableSatellitesRewards > 0) {
      const doormanContractInstance = await tezos?.wallet.at(doormanAddress)
      batchArr.push({
        kind: OpKind.TRANSACTION,
        ...doormanContractInstance.methods.compound([userAddress]).toTransferParams(),
      })
    }

    return await getEstimationBatchResult(tezos, batchArr)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

export const rewardsCompound = async (
  userAddress: string,
  doormanAddress: string,
): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos?.wallet.at(doormanAddress)
    const rewardsOperationMetaData = contract?.methods.compound([userAddress])

    return await getEstimationResult(rewardsOperationMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

export const getMVKTokensFromFaucet = async (
  mvkFaucetAddress: string,
): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(mvkFaucetAddress)
    const requestMVKMetaData = await contract.methods.requestMvk()

    return await getEstimationResult(requestMVKMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

export const distributeProposalRewards = async (
  governanceAddress: string,
  satelliteAddress: string,
  proposals: number[],
): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(governanceAddress)
    const distributeProposalsMetaData = await contract?.methods.distributeProposalRewards(satelliteAddress, proposals)

    return await getEstimationResult(distributeProposalsMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}
