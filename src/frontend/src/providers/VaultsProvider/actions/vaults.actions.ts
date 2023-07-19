// helpers
import { scrollUpPage } from 'utils/scrollUpPage'
import { WalletOperationError, unknownToError } from 'errors/error'
import { getEstimationBatchResult, getEstimationResult } from 'errors/helpers/estimateAction.helper'
import { convertNumberForContractCall } from 'utils/calcFunctions'

// consts
import { OpKind } from '@taquito/taquito'
import { DAPP_INSTANCE } from 'providers/UserProvider/user.provider'

// types
import { LoansTokenMetadataType } from 'providers/TokensProvider/tokens.provider.types'
import { ActionErrorReturnType, ActionSuccessReturnType } from 'providers/DappConfigProvider/dappConfig.provider.types'

// change vault name
export const changeVaultNameAction = async (
  newVaultName: string,
  vaultAddress: string,
  callback: () => void,
): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(vaultAddress)
    const changeVaultNameMetaData = contract.methods.initVaultAction('updateVaultName', newVaultName)

    return await getEstimationResult(changeVaultNameMetaData, {
      callback, // close popup
    })
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

// create vault
export const createVault = async (loanTokenName: string, vaultName: string, vaultFactoryAddress: string) => {
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

// borrow asset from the vault
export const borrowVaultAssetAction = async (
  lendingControllerAddress: string,
  vaultId: number,
  amountToBorrow: number,
  borrowedToken: LoansTokenMetadataType,
  callback: () => void,
): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  try {
    const { decimals } = borrowedToken
    // prepare and send transaction
    const convertedAssetAmount = convertNumberForContractCall({ number: amountToBorrow, grade: decimals })
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(lendingControllerAddress)
    const borrowVaultAssetMetaData = contract?.methods.borrow(vaultId, convertedAssetAmount)

    return await getEstimationResult(borrowVaultAssetMetaData, {
      callback, // close popup
    })
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

// partly repay vault
export const repayPartOfVaultAction = async (
  lendingControllerAddress: string,
  userAddress: string,
  vaultId: number,
  vaultAddress: string,
  repayAmount: number,
  borrowedToken: LoansTokenMetadataType,
  callback: () => void,
): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  try {
    const { decimals, address, type } = borrowedToken
    // prepare and send transaction
    const convertedAssetAmount = convertNumberForContractCall({ number: repayAmount, grade: decimals })
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(lendingControllerAddress)

    if (type === 'fa12') {
      const assetContract = await tezos.wallet.at(address)
      const batchArr = [
        {
          kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
          ...assetContract.methods.approve(vaultAddress, 0).toTransferParams(),
        },
        {
          kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
          ...assetContract.methods.approve(vaultAddress, convertedAssetAmount).toTransferParams(),
        },
        {
          kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
          ...contract?.methods.repay(vaultId, convertedAssetAmount).toTransferParams(),
        },
      ]

      return await getEstimationBatchResult(tezos, batchArr, callback)
    } else if (type === 'fa2') {
      const assetContract = await tezos.wallet.at(address)
      const batchArr = [
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
          ...contract?.methods.repay(vaultId, convertedAssetAmount).toTransferParams(),
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
    }

    const repayPartMetaData = contract?.methods.repay(vaultId, convertedAssetAmount)
    return await getEstimationResult(repayPartMetaData, {
      callback,
    })
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

// repay full vault and close it
export const repayFullAndCloseVaultAction = async (
  lendingControllerAddress: string,
  userAddress: string,
  vaultId: number,
  vaultAddress: string,
  repayAmount: number,
  borrowedToken: LoansTokenMetadataType,
  callback: () => void,
): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  try {
    const { decimals, address, type } = borrowedToken
    // prepare and send transaction
    const convertedAssetAmount = convertNumberForContractCall({ number: repayAmount, grade: decimals })
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(lendingControllerAddress)

    const cb = () => {
      callback() // close popup
      scrollUpPage() // scroll up to top of page, after closing vault
    }

    if (type === 'fa12') {
      const assetContract = await tezos.wallet.at(address)
      const batchArr = [
        {
          kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
          ...assetContract.methods.approve(vaultAddress, 0).toTransferParams(),
        },
        {
          kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
          ...assetContract.methods.approve(vaultAddress, convertedAssetAmount).toTransferParams(),
        },
        {
          kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
          ...contract?.methods.repay(vaultId, convertedAssetAmount).toTransferParams(),
        },
        {
          kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
          ...contract.methods.closeVault(vaultId).toTransferParams(),
        },
      ]

      return await getEstimationBatchResult(tezos, batchArr, cb)
    } else if (type === 'fa2') {
      const assetContract = await tezos.wallet.at(address)
      const batchArr = [
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
          ...contract?.methods.repay(vaultId, convertedAssetAmount).toTransferParams(),
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
        {
          kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
          ...contract.methods.closeVault(vaultId).toTransferParams(),
        },
      ]

      return await getEstimationBatchResult(tezos, batchArr, cb)
    }
    const batchArr = [
      {
        kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
        ...contract?.methods.repay(vaultId, convertedAssetAmount).toTransferParams(),
      },
      {
        kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
        ...contract.methods.closeVault(vaultId).toTransferParams(),
      },
    ]

    return await getEstimationBatchResult(tezos, batchArr, cb)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}
