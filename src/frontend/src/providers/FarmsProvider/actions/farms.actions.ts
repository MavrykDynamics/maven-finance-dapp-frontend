// consts
import { DAPP_INSTANCE } from 'providers/UserProvider/user.provider'

// utils
import { unknownToError, WalletOperationError } from 'errors/error'
import { getEstimationBatchResult, getEstimationResult } from 'errors/helpers/estimateAction.helper'

// types
import { ActionErrorReturnType, ActionSuccessReturnType } from 'providers/DappConfigProvider/dappConfig.provider.types'
import { convertNumberForContractCall } from 'utils/calcFunctions'
import { FarmsTokenMetadataType } from 'providers/TokensProvider/tokens.provider.types'
import { OpKind } from '@mavrykdynamics/webmavryk'

export const harvestRewards = async (
  farmAddress: string,
  userAddress: string,
): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(farmAddress)
    const harvestOperationMetaData = await contract?.methods.claim([userAddress])

    return await getEstimationResult(harvestOperationMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

export const depositToFarm = async (
  farmAddress: string,
  userAddress: string,
  amount: number,
  token: FarmsTokenMetadataType,
): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  try {
    const { decimals, type, address } = token
    const depositAmount = convertNumberForContractCall({ number: amount, grade: decimals })

    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(farmAddress)

    switch (type) {
      case 'fa12':
        const fa12AssetContract = await tezos.wallet.at(address)

        return await getEstimationBatchResult(tezos, [
          {
            kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
            ...fa12AssetContract.methods.approve(farmAddress, 0).toTransferParams(),
          },
          {
            kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
            ...fa12AssetContract.methods.approve(farmAddress, depositAmount).toTransferParams(),
          },
          {
            kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
            ...contract?.methods.deposit(depositAmount).toTransferParams(),
          },
        ])
      case 'fa2':
        const fa2AssetContract = await tezos.wallet.at(address)

        return await getEstimationBatchResult(tezos, [
          {
            kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
            ...fa2AssetContract.methods
              .update_operators([
                {
                  add_operator: {
                    owner: userAddress,
                    operator: farmAddress,
                    token_id: 0, // Should be a number, usually 0
                  },
                },
              ])
              .toTransferParams(),
          },
          {
            kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
            ...contract?.methods.deposit(depositAmount).toTransferParams(),
          },
          {
            kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
            ...fa2AssetContract.methods
              .update_operators([
                {
                  remove_operator: {
                    owner: userAddress,
                    operator: farmAddress,
                    token_id: 0, // Should be a number, usually 0
                  },
                },
              ])
              .toTransferParams(),
          },
        ])

      case 'mav':
        return await getEstimationBatchResult(tezos, [
          {
            kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
            ...contract?.methods.deposit(depositAmount).toTransferParams(),
            mumav: true,
            amount: depositAmount,
          },
        ])
    }
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

export const withdrawFromFarm = async (
  farmAddress: string,
  amount: number,
  token: FarmsTokenMetadataType,
): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  try {
    const { decimals } = token
    const withdrawAmount = convertNumberForContractCall({ number: amount, grade: decimals })

    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(farmAddress)
    const withdrawOperationMetaData = await contract?.methods.withdraw(withdrawAmount)

    return await getEstimationResult(withdrawOperationMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}
