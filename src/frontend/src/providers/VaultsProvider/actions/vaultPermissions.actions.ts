import { OpKind, TransferParams } from '@mavrykdynamics/webmavryk'
import { DAPP_INSTANCE } from 'providers/UserProvider/user.provider'
import { LoanVaultAllowanceType } from 'providers/LoansProvider/loans.provider.types'
import { WalletOperationError, unknownToError } from 'errors/error'
import { getEstimationBatchResult, getEstimationResult } from 'errors/helpers/estimateAction.helper'
import { VAULT_ALLOWANCE_ACCOUNTS, VAULT_ALLOWANCE_ANY } from 'pages/Loans/Loans.const'

type TokenOperator = {
  owner: string
  operator: string
  token_id: number
}

export type UpdateTokenOperator = {
  add_operator?: TokenOperator
  remove_operator?: TokenOperator
}

export const changeBakerAction = async (bakerAddress: string, vaultAddress: string, callback: () => void) => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(vaultAddress)
    const changeBakerMetaData = contract?.methods.initVaultAction('setBaker', bakerAddress)

    return await getEstimationResult(changeBakerMetaData, {
      callback, // close popup
    })
  } catch (error) {
    callback()
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

export const managePermissionsAction = async (
  vaultAddress: string,
  depostiorAllowance: LoanVaultAllowanceType,
  newDepositorsAddresses: Array<string>,
  vaultOriginalDepositros: Array<string>,
  userAddress: string,
  callback: () => void,
) => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(vaultAddress)
    // (TransferParams & { kind: OpKind.TRANSACTION })

    // if depostiorAllowance === VAULT_ALLOWANCE_ANY call updateDepositor with any 2 args and VAULT_ALLOWANCE_ANY config
    if (depostiorAllowance === VAULT_ALLOWANCE_ANY) {
      const managePermissionsMetaData = contract?.methods.initVaultAction('updateDepositor', VAULT_ALLOWANCE_ANY, true)
      return await getEstimationResult(managePermissionsMetaData, { callback })
    }

    // if newDepositorsAddresses is empty means we need to remove all depositors
    if (depostiorAllowance === VAULT_ALLOWANCE_ACCOUNTS && newDepositorsAddresses.length === 0) {
      const batchArr: (TransferParams & { kind: OpKind.TRANSACTION })[] =
        vaultOriginalDepositros.length === 0
          ? [
              {
                kind: OpKind.TRANSACTION,
                ...contract.methods
                  .initVaultAction('updateDepositor', VAULT_ALLOWANCE_ACCOUNTS, true, userAddress)
                  .toTransferParams(),
              },
              {
                kind: OpKind.TRANSACTION,
                ...contract.methods
                  .initVaultAction('updateDepositor', VAULT_ALLOWANCE_ACCOUNTS, false, userAddress)
                  .toTransferParams(),
              },
            ]
          : vaultOriginalDepositros.map((depositorAddress) => ({
              kind: OpKind.TRANSACTION,
              ...contract.methods
                .initVaultAction('updateDepositor', VAULT_ALLOWANCE_ACCOUNTS, false, depositorAddress)
                .toTransferParams(),
            }))

      return await getEstimationBatchResult(tezos, batchArr, callback)
    }

    // if newDepositorsAddresses is not empty means we need to add new depositors or remove some of the old ones
    if (depostiorAllowance === VAULT_ALLOWANCE_ACCOUNTS && newDepositorsAddresses.length !== 0) {
      const depositorsToRemove = vaultOriginalDepositros.filter(
        (depositorAddress) => !newDepositorsAddresses.includes(depositorAddress),
      )
      const depositorsToAdd = newDepositorsAddresses.filter(
        (depositorAddress) => !vaultOriginalDepositros.includes(depositorAddress),
      )

      const batchArr = [
        ...depositorsToRemove.map((depositorAddress) => ({
          kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
          ...contract.methods
            .initVaultAction('updateDepositor', VAULT_ALLOWANCE_ACCOUNTS, false, depositorAddress)
            .toTransferParams(),
        })),
        ...depositorsToAdd.map((depositorAddress) => ({
          kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
          ...contract.methods
            .initVaultAction('updateDepositor', VAULT_ALLOWANCE_ACCOUNTS, true, depositorAddress)
            .toTransferParams(),
        })),
      ]

      return await getEstimationBatchResult(tezos, batchArr, callback)
    }

    throw new Error(`Cant't update depositors.`)
  } catch (error) {
    callback()
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

export const updateOperatorsAction = async (
  vaultAddress: string,
  tokenName: string,
  updateOperators: UpdateTokenOperator[],
  callback: () => void,
) => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(vaultAddress)
    const updateOperatorsMetaData = contract?.methods.initVaultAction(
      'updateTokenOperators',
      tokenName,
      updateOperators,
    )

    return await getEstimationResult(updateOperatorsMetaData, {
      callback, // close popup
    })
  } catch (error) {
    callback()
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}
