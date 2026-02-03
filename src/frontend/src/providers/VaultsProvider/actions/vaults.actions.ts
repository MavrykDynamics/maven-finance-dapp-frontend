// helpers
import { WalletOperationError, unknownToError } from 'errors/error'
import { getEstimationBatchResult, getEstimationResult } from 'errors/helpers/estimateAction.helper'
import { convertNumberForContractCall } from 'utils/calcFunctions'
import {
  buildFA12ApprovalOps,
  buildFA2AddOperatorOp,
  buildFA2RemoveOperatorOp,
  buildTokenApprovalBatch,
} from 'providers/common/utils/tokenOperations'

// consts
import { OpKind, TransferParams } from '@mavrykdynamics/webmavryk'
import { DAPP_INSTANCE } from 'providers/UserProvider/user.provider'

// types
import {
  LoansCollateralTokenMetadataType,
  LoansTokenMetadataType,
} from 'providers/TokensProvider/tokens.provider.types'
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
): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  try {
    const { decimals, address, type } = borrowedToken
    // prepare and send transaction
    const convertedAssetAmount = convertNumberForContractCall({ number: repayAmount, grade: decimals })
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(lendingControllerAddress)

    const mainOp = {
      kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
      ...contract?.methods.repay(vaultId, convertedAssetAmount).toTransferParams(),
    }

    // FA12 approves to vaultAddress; FA2 operators use lendingControllerAddress
    const spender = type === 'fa12' ? vaultAddress : lendingControllerAddress

    const batchOps = await buildTokenApprovalBatch({
      tezos,
      tokenType: type,
      tokenAddress: address,
      spender,
      owner: userAddress,
      amount: convertedAssetAmount,
      mainOps: [mainOp],
    })

    return await getEstimationBatchResult(tezos, batchOps)
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
): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  try {
    const { decimals, address, type } = borrowedToken
    // prepare and send transaction
    const convertedAssetAmount = convertNumberForContractCall({ number: repayAmount, grade: decimals })
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(lendingControllerAddress)

    const closeVaultOp = {
      kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
      ...contract.methods.closeVault(vaultId).toTransferParams(),
    }

    // If nothing to repay, just close
    if (convertedAssetAmount === 0) {
      return await getEstimationBatchResult(tezos, [closeVaultOp])
    }

    const repayOp = {
      kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
      ...contract?.methods.repay(vaultId, convertedAssetAmount).toTransferParams(),
    }

    // FA12 approves to vaultAddress; FA2 operators use lendingControllerAddress
    const spender = type === 'fa12' ? vaultAddress : lendingControllerAddress

    const repayOps = await buildTokenApprovalBatch({
      tezos,
      tokenType: type,
      tokenAddress: address,
      spender,
      owner: userAddress,
      amount: convertedAssetAmount,
      mainOps: [repayOp],
    })

    return await getEstimationBatchResult(tezos, [...repayOps, closeVaultOp])
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

    const _collaterals = collateralTokens.reduce<{ amount: number; tokenName: string }[]>(
      (acc, { amount, loanData: { indexerName } }) => {
        acc.push({
          amount,
          tokenName: indexerName,
        })

        return acc
      },
      [],
    )

    const tezCollateral = collateralTokens.find((c) => c.type === 'mav')
    const tezTokenData = tezCollateral
      ? {
          amount: tezCollateral.amount,
          mumav: true,
        }
      : {}

    const createVaultOp = {
      kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
      ...vaultFactoryContract.methods
        .createVault(delegateToAddress, loanTokenName, vaultName, _collaterals, 'any')
        .toTransferParams(),
      ...tezTokenData,
    }

    const batchArr = await collateralTokens.reduce<
      Promise<
        (TransferParams & {
          kind: OpKind.TRANSACTION
        })[]
      >
    >(
      async (promiseAcc, { id, type, address, amount }) => {
        const acc = await promiseAcc

        if (type === 'fa12') {
          const contract = await tezos.wallet.at(address)
          acc.unshift(...buildFA12ApprovalOps(contract, vaultFactoryAddress, amount))
        }

        if (type === 'fa2') {
          const contract = await tezos.wallet.at(address)
          acc.unshift(buildFA2AddOperatorOp(contract, userAddress, vaultFactoryAddress, id))
          acc.push(buildFA2RemoveOperatorOp(contract, userAddress, vaultFactoryAddress, id))
        }

        return acc
      },
      Promise.resolve([createVaultOp]),
    )

    return await getEstimationBatchResult(tezos, batchArr)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

