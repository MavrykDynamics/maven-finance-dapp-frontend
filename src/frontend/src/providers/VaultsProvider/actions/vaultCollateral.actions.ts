import { OpKind, TransferParams } from '@taquito/taquito'
import { WalletOperationError, unknownToError } from 'errors/error'
import { getEstimationBatchResult, getEstimationResult } from 'errors/helpers/estimateAction.helper'
import { estimateBatchOperation } from 'errors/helpers/walletError.helper'
import { LoansCollateralTokenMetadataType } from 'providers/TokensProvider/tokens.provider.types'
import { DAPP_INSTANCE } from 'providers/UserProvider/user.provider'
import { convertNumberForContractCall } from 'utils/calcFunctions'

// remove collateral from the vault
export const withdrawCollateralAction = async (
  withdrawAmount: number,
  collateralToken: LoansCollateralTokenMetadataType,
  vaultAddress: string,
  callback: () => void,
) => {
  try {
    const {
      decimals,
      loanData: { indexerName },
    } = collateralToken
    // prepare and send transaction
    const convertedAssetAmount = convertNumberForContractCall({ number: withdrawAmount, grade: decimals })
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(vaultAddress)
    const withdrawCollateralMetaData = contract.methods.initVaultAction('withdraw', convertedAssetAmount, indexerName)

    return await getEstimationResult(withdrawCollateralMetaData, { callback })
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

export const withdrawStakedCollateralAction = async (
  withdrawAmount: number,
  collateralToken: LoansCollateralTokenMetadataType,
  vaultId: number,
  lendingControllerAddress: string,
  callback: () => void,
) => {
  try {
    const {
      decimals,
      loanData: { indexerName },
    } = collateralToken
    // prepare and send transaction
    const convertedAssetAmount = convertNumberForContractCall({ number: withdrawAmount, grade: decimals })
    const tezos = await DAPP_INSTANCE.tezos()

    const contract = await tezos.wallet.at(lendingControllerAddress)
    const withdrawCollateralMetaData = contract.methods.vaultWithdrawStakedToken(
      indexerName,
      vaultId,
      convertedAssetAmount,
    )

    return await getEstimationResult(withdrawCollateralMetaData, { callback })
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

// deposit collaterals to the vault
export const depositCollateralsAction = async (
  userAddress: string,
  vaultAddress: string,
  collateralTokens: Array<
    LoansCollateralTokenMetadataType & {
      amount: number
    }
  >,
  vaultId: number,
  lendingControllerAddress: string,
  callback: () => void,
  bakerAddress?: string | null,
) => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(vaultAddress)

    const operationKind = OpKind.TRANSACTION as OpKind.TRANSACTION

    const batchArr = await collateralTokens.reduce<Promise<Array<TransferParams & { kind: OpKind.TRANSACTION }>>>(
      async (promiseAcc, { loanData: { indexerName, isStaked }, amount, id, address, type }) => {
        const acc = await promiseAcc

        if (isStaked) {
          const controllerContract = await tezos.wallet.at(lendingControllerAddress)
          acc.push({
            kind: operationKind,
            ...controllerContract.methods.vaultDepositStakedToken(indexerName, vaultId, amount).toTransferParams(),
          })
          return acc
        }

        if (type === 'tez') {
          acc.push({
            kind: operationKind,
            ...contract.methods.initVaultAction('deposit', amount, 'tez').toTransferParams(),
            amount,
            mutez: true,
          })

          if (bakerAddress) {
            acc.push({
              kind: operationKind,
              ...contract.methods.initVaultAction('setBaker', bakerAddress).toTransferParams(),
            })
          }
          return acc
        }

        if (type === 'fa12') {
          const assetContract = await tezos.wallet.at(address)

          acc.push({
            kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
            ...assetContract.methods.approve(vaultAddress, 0).toTransferParams(),
          })
          acc.push({
            kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
            ...assetContract.methods.approve(vaultAddress, amount).toTransferParams(),
          })
          acc.push({
            kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
            ...contract.methods.initVaultAction('deposit', amount, indexerName).toTransferParams(),
          })
          return acc
        }

        if (type === 'fa2') {
          const assetContract = await tezos.wallet.at(address)

          acc.push({
            kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
            ...assetContract.methods
              .update_operators([
                {
                  add_operator: {
                    owner: userAddress,
                    operator: vaultAddress,
                    token_id: id,
                  },
                },
              ])
              .toTransferParams(),
          })
          acc.push({
            kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
            ...contract.methods.initVaultAction('deposit', amount, indexerName).toTransferParams(),
          })
          acc.push({
            kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
            ...assetContract.methods
              .update_operators([
                {
                  remove_operator: {
                    owner: userAddress,
                    operator: vaultAddress,
                    token_id: id,
                  },
                },
              ])
              .toTransferParams(),
          })
          return acc
        }

        return acc
      },
      Promise.resolve([]),
    )

    // TODO remove it when rstimation will be back
    // temporary solution to show error toast for deposit action
    // cases (when selected baker can't handle the token you typed)
    // ----------------------------------------------------------------------------
    const estimateBatchOp = await estimateBatchOperation(batchArr)

    if (estimateBatchOp.error) {
      return { actionSuccess: false, error: estimateBatchOp.error }
    }

    const operation = await tezos.wallet.batch(batchArr).send()

    callback?.()

    return { actionSuccess: true, operation }
    // ----------------------------------------------------------------------------
    // uncomment the line below and remove all code between 179 and 191 lines when restoring estimation logic!
    // return await getEstimationBatchResult(tezos, batchArr, callback)
  } catch (error) {
    callback()
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}
