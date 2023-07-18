import { OpKind, TransferParams } from '@taquito/taquito'
import { unknownToError } from 'errors/error'
import { getEstimationBatchResult, getEstimationResult } from 'errors/helpers/estimateAction.helper'
import { LoansCollateralTokenMetadataType } from 'providers/TokensProvider/tokens.provider.types'
import { DAPP_INSTANCE } from 'providers/UserProvider/user.provider'
import { TokenType } from 'utils/TypesAndInterfaces/General'
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
    return { actionSuccess: false, error: unknownToError(error) }
  }
}

// deposit collaterals to the vault
export const depositCollateralsAction = async (
  userAddress: string,
  vaultAddress: string,
  collateralTokens: Array<{
    collateralName: string
    amount: number
    id: number
    address: string
    type: TokenType
  }>,
  callback: () => void,
  bakerAddress?: string | null,
) => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(vaultAddress)

    const operationKind = OpKind.TRANSACTION as OpKind.TRANSACTION

    const batchArr = await collateralTokens.reduce<Promise<Array<TransferParams & { kind: OpKind.TRANSACTION }>>>(
      async (promiseAcc, { collateralName, amount, id, address, type }) => {
        const acc = await promiseAcc

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
            ...contract.methods.initVaultAction('deposit', amount, collateralName).toTransferParams(),
          })
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
            ...contract.methods.initVaultAction('deposit', amount, collateralName).toTransferParams(),
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
        }

        return acc
      },
      Promise.resolve([]),
    )

    return await getEstimationBatchResult(tezos, batchArr, callback)
  } catch (error) {
    callback()
    return { actionSuccess: false, error: unknownToError(error) }
  }
}
