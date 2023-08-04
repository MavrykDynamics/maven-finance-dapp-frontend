// helpers
import { scrollUpPage } from 'utils/scrollUpPage'
import { WalletOperationError, unknownToError } from 'errors/error'
import { getEstimationBatchResult, getEstimationResult } from 'errors/helpers/estimateAction.helper'
import { convertNumberForContractCall } from 'utils/calcFunctions'

// consts
import { OpKind, TransferParams } from '@taquito/taquito'
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

// create vault
// export const createVault = async (loanTokenName: string, vaultName: string, vaultFactoryAddress: string) => {
//   try {
//     // prepare and send transaction
//     const tezos = await DAPP_INSTANCE.tezos()
//     const contract = await tezos.wallet.at(vaultFactoryAddress)
//     const vaultCreateMetaData = contract?.methods.createVault(null, loanTokenName, vaultName, [], 'any')

//     return await getEstimationResult(vaultCreateMetaData)
//   } catch (error) {
//     const e = unknownToError(error)
//     return { actionSuccess: false, error: new WalletOperationError(e) }
//   }
// }

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

// ---------------------------------------------

// create vault
export const createVault = async (
  userAddress: string,
  loanTokenName: string,
  vaultName: string,
  vaultFactoryAddress: string,
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
    const contract = await tezos.wallet.at(vaultFactoryAddress)

    const operationKind = OpKind.TRANSACTION as OpKind.TRANSACTION

    const userCreatesNewVaultOperation = contract.methods.createVault(
      delegateToAddress, // bakery address to delegate tez to. Can also be null. Same as before update
      loanTokenName, // loan token name. Same as before update
      vaultName, // vault name. Same as before update
      [
        {
          amount: collateralTokens[0].amount, //Amount of tez to deposit as collateral. Note it also needs to be sent in the
          // .send() at the end of this method call. This is not new, its how its done for the normal collateral deposit
          tokenName: 'tez',
        },
      ],
      'any', // depositors config type - any / whitelist. Same as before update
    )

    // return { actionSuccess: true, operation: userCreatesNewVaultOperation }

    return await getEstimationResult(userCreatesNewVaultOperation, {
      params: { mutez: true, amount: collateralTokens[0].amount },
    })
    // const { arr, lastOperator, tezData } = await collateralTokens.reduce<
    //   Promise<{
    //     arr: Array<TransferParams & { kind: OpKind.TRANSACTION }>
    //     lastOperator: (TransferParams & { kind: OpKind.TRANSACTION }) | null
    //     tezData: { amount: number; mutez: boolean } | null
    //   }>
    // >(async (promiseAcc, { amount, id, address, type }) => {
    //   const acc = await promiseAcc

    //   // TODO ask smvk for createVault
    //   // if (isStaked) {
    //   //   const controllerContract = await tezos.wallet.at(lendingControllerAddress)
    //   //   acc.push({
    //   //     kind: operationKind,
    //   //     ...controllerContract.methods.vaultDepositStakedToken(indexerName, vaultId, amount).toTransferParams(),
    //   //   })
    //   //   return acc
    //   // }

    //   if (type === 'fa2') {
    //     const assetContract = await tezos.wallet.at(address)

    //     const fa2AddOperatorsBatchObject = {
    //         kind: operationKind,
    //         ...assetContract.methods
    //           .update_operators([
    //             {
    //               add_operator: {
    //                 owner: userAddress,
    //                 operator: vaultFactoryAddress,
    //                 token_id: id, // Should be a number, usually 0
    //               },
    //             },
    //           ])
    //           .toTransferParams(),
    //       },
    //       fa2RemoveOperatorsBatchObject = {
    //         kind: operationKind,
    //         ...assetContract.methods
    //           .update_operators([
    //             {
    //               remove_operator: {
    //                 owner: userAddress,
    //                 operator: vaultFactoryAddress,
    //                 token_id: id, // Should be a number, usually 0
    //               },
    //             },
    //           ])
    //           .toTransferParams(),
    //       }

    //     // TODO add remevo at the end of the batrch arr
    //     acc.lastOperator = fa2RemoveOperatorsBatchObject
    //     acc.arr.push(fa2AddOperatorsBatchObject)

    //     return acc
    //   }

    //   if (type === 'fa12') {
    //     const assetContract = await tezos.wallet.at(address)

    //     const fa12ResetApprovalBatchObject = {
    //         kind: operationKind,
    //         ...assetContract.methods
    //           .approve(
    //             vaultFactoryAddress, // Address to reset the spending allowance of
    //             0, // Set to 0 to the address can't spend any tokens
    //           )
    //           .toTransferParams(),
    //       },
    //       fa12AddApprovalBatchObject = {
    //         kind: operationKind,
    //         ...assetContract.methods
    //           .approve(
    //             vaultFactoryAddress, // Address to approve to spend X tokens of the user
    //             amount, // X amount of tokens an address will be approved to spend
    //           )
    //           .toTransferParams(),
    //       }

    //     acc.arr.push(fa12ResetApprovalBatchObject, fa12AddApprovalBatchObject)
    //     return acc
    //   }

    //   if (type === 'tez') {
    //     acc.tezData = {
    //       amount, // Need to add the amount of tez being sent
    //       mutez: true,
    //     }
    //   }

    //   return acc
    // }, Promise.resolve({ arr: [], lastOperator: null, tezData: null }))

    // const selectedCollateralsDataArr = collateralTokens.reduce<
    //   {
    //     amount: number
    //     tokenName: TokenType
    //   }[]
    // >((acc, { amount, type }) => {
    //   acc.push({
    //     amount,
    //     tokenName: type,
    //   })
    //   return acc
    // }, [])

    // const batchedCreateVaultData = {
    //   kind: operationKind,
    //   ...contract.methods
    //     .createVault(
    //       delegateToAddress, // null OR the bakery address to delegate the collateralized tez to
    //       loanTokenName, // loan token name
    //       vaultName, // vault name
    //       selectedCollateralsDataArr, // arr of deposited collateral tokens with amount
    //       'any', // depositors config type - any / whitelist
    //     )
    //     .toTransferParams(),
    //   ...tezData, // only for tez token, if it's null - it will provide no data
    // }

    // const batchArr = [...arr, batchedCreateVaultData]
    // if (lastOperator) batchArr.push(lastOperator)

    // return await getEstimationBatchResult(tezos, batchArr)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}
