// consts
import { OpKind } from '@taquito/taquito'
import { DAPP_INSTANCE } from 'providers/UserProvider/user.provider'

// helpers
import { WalletOperationError, unknownToError } from 'errors/error'
import { getEstimationBatchResult, getEstimationResult } from 'errors/helpers/estimateAction.helper'
import { convertNumberForContractCall } from 'utils/calcFunctions'

// types
import { LoansTokenMetadataType } from 'providers/TokensProvider/tokens.provider.types'

export const triggerInitialVaultCreation = async (
  loanTokenName: string,
  vaultName: string,
  vaultFactoryAddress: string,
) => {
  // TODO when calling this action add userAddress comparance
  // check whether we can send transaction
  // if (!userAddress) {
  //   await dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
  //   return
  // }

  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(vaultFactoryAddress)
    const vaultCreateMetaData = contract?.methods.createVault(null, loanTokenName, vaultName, [], 'any')

    // TODO handle return vault address
    // const { value } = await checkIndexerLevelAndRunDataUpdateCallback({
    //   callback: async () => {

    //     const newVaultData = await fetchFromIndexer(
    //       NEW_VAULT_QUERY,
    //       NEW_VAULT_QUERY_NAME,
    //       NEW_VAULT_QUERY_VARIABLE(userAddress, vaultName),
    //     )

    //     return newVaultData.vault.at(-1)?.lending_controller_vaults?.[0]?.vault?.address
    //   },
    //   currentOperationLevel,
    // })

    // return value
    return await getEstimationResult(vaultCreateMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

export const depositLendingAssetAction = async (
  userAddress: string,
  loanToken: LoansTokenMetadataType,
  addLiquidityAmount: number,
  lendingControllerAddress: string,
  callback: () => void,
) => {
  try {
    const {
      decimals,
      type,
      loanData: { indexerName },
      address,
    } = loanToken

    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const convertedAssetAmount = convertNumberForContractCall({ number: addLiquidityAmount, grade: decimals })
    const contract = await tezos.wallet.at(lendingControllerAddress)

    if (type === 'tez') {
      const depositTezMetaData = contract?.methods.addLiquidity(indexerName, convertedAssetAmount)

      return await getEstimationResult(depositTezMetaData, {
        params: { amount: convertedAssetAmount, mutez: true },
        callback,
      })
    } else if (type === 'fa12') {
      const assetContract = await tezos.wallet.at(address)

      const batchArr = [
        {
          kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
          ...assetContract.methods.approve(lendingControllerAddress, 0).toTransferParams(),
        },
        {
          kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
          ...assetContract.methods.approve(lendingControllerAddress, convertedAssetAmount).toTransferParams(),
        },
        {
          kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
          ...contract?.methods.addLiquidity(convertedAssetAmount, indexerName).toTransferParams(),
        },
      ]
      return await getEstimationBatchResult(tezos, batchArr, callback)
    }

    const assetContract = await tezos.wallet.at(address)
    const batchArr = await [
      {
        kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
        ...assetContract.methods
          .update_operators([
            {
              add_operator: {
                owner: userAddress,
                operator: lendingControllerAddress,
                token_id: 0, // Should be a number, usually 0
              },
            },
          ])
          .toTransferParams(),
      },
      {
        kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
        ...contract.methods.addLiquidity(indexerName, convertedAssetAmount).toTransferParams(),
      },
      {
        kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
        ...assetContract.methods
          .update_operators([
            {
              remove_operator: {
                owner: userAddress,
                operator: lendingControllerAddress,
                token_id: 0, // Should be a number, usually 0
              },
            },
          ])
          .toTransferParams(),
      },
    ]
    return await getEstimationBatchResult(tezos, batchArr, callback)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

export const withdrawLendingAssetAction = async (
  lendingControllerAddress: string,
  removeLiquidityAmount: number,
  loanToken: LoansTokenMetadataType,
  callback: () => void,
) => {
  try {
    const {
      decimals,
      loanData: { indexerName },
    } = loanToken
    // prepare and send transaction
    const convertedAssetAmount = convertNumberForContractCall({ number: removeLiquidityAmount, grade: decimals })
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(lendingControllerAddress)
    const withdrawLendingAssetMetaData = contract?.methods.removeLiquidity(indexerName, convertedAssetAmount)

    return await getEstimationResult(withdrawLendingAssetMetaData, { callback })
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}
