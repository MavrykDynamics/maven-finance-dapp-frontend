// helpers
import { scrollUpPage } from 'utils/scrollUpPage'
import { WalletOperationError, unknownToError } from 'errors/error'
import { getEstimationBatchResult, getEstimationResult } from 'errors/helpers/estimateAction.helper'
import { convertNumberForContractCall } from 'utils/calcFunctions'

// consts
import { ContractAbstraction, OpKind, TezosToolkit, TransferParams, Wallet } from '@taquito/taquito'
import { DAPP_INSTANCE } from 'providers/UserProvider/user.provider'

// types
import {
  LoansCollateralTokenMetadataType,
  LoansTokenMetadataType,
} from 'providers/TokensProvider/tokens.provider.types'
import { ActionErrorReturnType, ActionSuccessReturnType } from 'providers/DappConfigProvider/dappConfig.provider.types'
import { TokenType } from 'utils/TypesAndInterfaces/General'

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

// borrow asset from the vault
export const borrowVaultAssetAction = async (
  lendingControllerAddress: string,
  vaultId: number,
  amountToBorrow: number,
  borrowedToken: LoansTokenMetadataType,
  callback?: () => void,
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

// create vault
export const createVault = async (
  userAddress: string,
  loanTokenName: string,
  vaultName: string,
  vaultFactoryAddress: string,
  lendingControllerAddress: string,
  collateralTokens: Array<
    LoansCollateralTokenMetadataType & {
      amount: number
    }
  >,
  delegateToAddress: string | null = null, // baker address
) => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()

    const vaultFactoryContract = await tezos.wallet.at(vaultFactoryAddress)

    const _collaterals = collateralTokens.reduce<{ amount: number; tokenName: TokenType }[]>(
      (acc, { amount, loanData: { indexerName } }) => {
        acc.push({
          amount,
          tokenName: indexerName,
        })

        return acc
      },
      [],
    )

    const tezTokenData = _collaterals.reduce<{ amount?: number; mutez?: boolean }>((acc, { amount, tokenName }) => {
      if (tokenName === 'tez') {
        acc = {
          amount,
          mutez: true,
        }
      }
      return acc
    }, {})

    const batchArr = await collateralTokens.reduce<
      Promise<
        (TransferParams & {
          kind: OpKind.TRANSACTION
        })[]
      >
    >(
      async (promiseAcc, { id, type, address, amount, loanData: { isStaked } }) => {
        const acc = await promiseAcc

        if (type === 'fa12') {
          const contract = await tezos.wallet.at(address)

          const fa12ResetApprovalBatchObject = getBacthObject_fa12(vaultFactoryAddress, contract, 0)
          const fa12AddApprovalBatchObject = getBacthObject_fa12(vaultFactoryAddress, contract, amount)

          acc.unshift(fa12ResetApprovalBatchObject, fa12AddApprovalBatchObject)
        }

        if (type === 'fa2') {
          const _address = isStaked ? lendingControllerAddress : address
          const contract = await tezos.wallet.at(_address)

          const fa2AddOperatorsBatchObject = getBatchObject_fa2(
            userAddress,
            vaultFactoryAddress,
            contract,
            'add_operator',
            id,
          )
          const fa2RemoveOperatorsBatchObject = getBatchObject_fa2(
            userAddress,
            vaultFactoryAddress,
            contract,
            'remove_operator',
            id,
          )

          acc.unshift(fa2AddOperatorsBatchObject)
          acc.push(fa2RemoveOperatorsBatchObject)
        }

        return acc
      },
      Promise.resolve([
        {
          kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
          ...vaultFactoryContract.methods
            .createVault(delegateToAddress, loanTokenName, vaultName, _collaterals, 'any')
            .toTransferParams(),
          ...tezTokenData,
        },
      ]),
    )

    return await getEstimationBatchResult(tezos, batchArr)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

// create vault helpers -------------------

function getBatchObject_fa2(
  userAddress: string,
  vaultFactoryAddress: string,
  factoryContract: PromiseResolvedType<ReturnType<TezosToolkit['wallet']['at']>>,
  operation: 'add_operator' | 'remove_operator',
  token_id: number,
) {
  return {
    kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
    ...factoryContract.methods
      .update_operators([
        {
          [operation]: {
            owner: userAddress,
            operator: vaultFactoryAddress,
            token_id,
          },
        },
      ])
      .toTransferParams(),
  }
}

function getBacthObject_fa12(
  vaultFactoryAddress: string,
  factoryContract: PromiseResolvedType<ReturnType<TezosToolkit['wallet']['at']>>,
  amount = 0,
) {
  return {
    kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
    ...factoryContract.methods
      .approve(
        vaultFactoryAddress, // Address to reset the spending allowance of
        amount, // Set to 0 to the address can't spend any tokens
      )
      .toTransferParams(),
  }
}

// ----------------------------------------
