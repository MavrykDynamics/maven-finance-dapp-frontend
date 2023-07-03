import { DAPP_INSTANCE } from 'app/App.components/ConnectWallet/ConnectWallet.actions'
import { unknownToError } from 'errors/error'
import { estimateExecution } from 'errors/helpers/walletError.helper'
import { ActionErrorReturnType, ActionSuccessReturnType } from 'providers/DappConfigProvider/dappConfig.provider.types'

export const rewardsCompound = async (
  userAddress: string,
  doormanAddress: string,
): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos?.wallet.at(doormanAddress)
    const rewardsOperationMetaData = contract?.methods.compound(userAddress)
    const op = await estimateExecution(rewardsOperationMetaData)

    if (op?.error) {
      return { actionSuccess: false, error: op.error }
    }

    const operation = await rewardsOperationMetaData.send()

    return { actionSuccess: true, operation }
  } catch (error) {
    return { actionSuccess: false, error: unknownToError(error) }
  }
}

export const claimVestingReward = async (vestingAddress: string) => {
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
