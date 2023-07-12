import { OpKind, TransactionWalletOperation } from '@taquito/taquito'
import { BatchWalletOperation } from '@taquito/taquito/dist/types/wallet/batch-operation'

import { DAPP_INSTANCE } from 'providers/UserProvider/user.provider'
import { toggleActionCompletion, toggleActionFullScreenLoader } from 'app/App.components/Loader/Loader.action'
import { hideToaster, showToaster } from 'app/App.components/Toaster/Toaster.actions'

import {
  ACTION_COMPLETION_MESSAGE_TEXT,
  ACTION_START_MESSAGE_TEXT,
  TOASTER_ERROR,
  TOASTER_INFO,
  TOASTER_LOADING,
  TOASTER_SUCCESS,
  TOASTER_UPDATE_DATA_AFTER_ACTION_DATA,
} from 'app/App.components/Toaster/Toaster.constants'
import { VAULT_ALLOWANCE_ACCOUNTS, VAULT_ALLOWANCE_ANY } from '../Loans.const'

import { AppDispatch, GetState } from 'app/App.controller'
import { State } from 'reducers'

import { checkIndexerLevelAndRunDataUpdateCallback } from 'utils/checkIndexerLevel/checkIndexerLevel'
import { LoanVaultAllowanceType } from 'providers/LoansProvider/loans.provider.types'

type TokenOperator = {
  owner: string
  operator: string
  token_id: number
}

export type UpdateTokenOperator = {
  add_operator?: TokenOperator
  remove_operator?: TokenOperator
}

export const changeBakerAction =
  (bakerAddress: string, vaultAddress: string, callback: () => void) =>
  async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    // check whether we can send transaction
    if (!state.wallet.accountPkh) {
      await dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    try {
      // prepare and send transaction
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(vaultAddress)
      const transaction = await contract?.methods.initVaultAction('setBaker', bakerAddress).send()

      // close popup
      callback()
      dispatch(toggleActionFullScreenLoader(true))
      dispatch(toggleActionCompletion(true))
      dispatch(showToaster(TOASTER_INFO, 'Changing XTZ Baker...', ACTION_START_MESSAGE_TEXT))

      // turn off fs actions loader and start data updating after 5s after operation started
      setTimeout(async () => {
        await dispatch(toggleActionFullScreenLoader(false))
        await dispatch(
          showToaster(
            TOASTER_LOADING,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.title,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.message,
          ),
        )

        // @ts-ignore don't have proper type to acees data, type has only methods
        const currentOperationLevel = transaction?.lastHead?.header?.level

        // refetch data we need
        await checkIndexerLevelAndRunDataUpdateCallback({
          callback: async () => {
            await dispatch(hideToaster())
            await dispatch(showToaster(TOASTER_SUCCESS, 'Baker changed.', ACTION_COMPLETION_MESSAGE_TEXT))
            await dispatch(toggleActionCompletion(false))
          },
          currentOperationLevel,
        })
      }, 5000)
    } catch (error) {
      console.error('changeBakerAction error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
        callback()
      }
      dispatch(toggleActionFullScreenLoader(false))
      dispatch(toggleActionCompletion(false))
    }
  }

export const managePermissionsAction =
  (
    vaultAddress: string,
    depostiorAllowance: LoanVaultAllowanceType,
    newDepositorsAddresses: Array<string>,
    vaultOriginalDepositros: Array<string>,
    callback: () => void,
  ) =>
  async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    // check whether we can send transaction
    if (!state.wallet.accountPkh) {
      await dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    try {
      // prepare and send transaction
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(vaultAddress)
      let transaction: TransactionWalletOperation | BatchWalletOperation | null = null

      // if depostiorAllowance === VAULT_ALLOWANCE_ANY call updateDepositor with any 2 args and VAULT_ALLOWANCE_ANY config
      if (depostiorAllowance === VAULT_ALLOWANCE_ANY) {
        transaction = await contract?.methods.initVaultAction('updateDepositor', VAULT_ALLOWANCE_ANY, true).send()
      }

      // if newDepositorsAddresses is empty means we need to remove all depositors
      if (depostiorAllowance === VAULT_ALLOWANCE_ACCOUNTS && newDepositorsAddresses.length === 0) {
        const batch = tezos.wallet.batch(
          vaultOriginalDepositros.length === 0
            ? [
                {
                  kind: OpKind.TRANSACTION,
                  ...contract.methods
                    .initVaultAction('updateDepositor', VAULT_ALLOWANCE_ACCOUNTS, false)
                    .toTransferParams(),
                },
              ]
            : vaultOriginalDepositros.map((depositorAddress) => ({
                kind: OpKind.TRANSACTION,
                ...contract.methods
                  .initVaultAction('updateDepositor', VAULT_ALLOWANCE_ACCOUNTS, false, depositorAddress)
                  .toTransferParams(),
              })),
        )
        transaction = await batch?.send()
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

        const batch = tezos.wallet.batch(batchArr)
        transaction = await batch?.send()
      }

      // close popup
      callback()
      dispatch(toggleActionFullScreenLoader(true))
      dispatch(toggleActionCompletion(true))
      dispatch(showToaster(TOASTER_INFO, 'Updating depositors...', ACTION_START_MESSAGE_TEXT))

      // turn off fs actions loader and start data updating after 5s after operation started
      setTimeout(async () => {
        await dispatch(toggleActionFullScreenLoader(false))
        await dispatch(
          showToaster(
            TOASTER_LOADING,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.title,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.message,
          ),
        )

        // @ts-ignore don't have proper type to acees data, type has only methods
        const currentOperationLevel = transaction?.lastHead?.header?.level

        // refetch data we need
        await checkIndexerLevelAndRunDataUpdateCallback({
          callback: async () => {
            await dispatch(hideToaster())
            await dispatch(showToaster(TOASTER_SUCCESS, 'Depositors updated.', ACTION_COMPLETION_MESSAGE_TEXT))
            await dispatch(toggleActionCompletion(false))
          },
          currentOperationLevel,
        })
      }, 5000)
    } catch (error) {
      console.error('managePermissionsAction error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
        callback()
      }
      dispatch(toggleActionFullScreenLoader(false))
    }
  }

export const updateOperatorsAction =
  (vaultAddress: string, tokenName: string, updateOperators: UpdateTokenOperator[], callback: () => void) =>
  async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    // check whether we can send transaction
    if (!state.wallet.accountPkh) {
      await dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    try {
      // prepare and send transaction
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(vaultAddress)
      const transaction = await contract?.methods
        .initVaultAction('updateTokenOperators', tokenName, updateOperators)
        .send()

      // close popup
      callback()
      dispatch(toggleActionFullScreenLoader(true))
      dispatch(toggleActionCompletion(true))
      dispatch(showToaster(TOASTER_INFO, 'Updating operators...', ACTION_START_MESSAGE_TEXT))

      // turn off fs actions loader and start data updating after 5s after operation started
      setTimeout(async () => {
        await dispatch(toggleActionFullScreenLoader(false))
        await dispatch(
          showToaster(
            TOASTER_LOADING,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.title,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.message,
          ),
        )

        // @ts-ignore don't have proper type to acees data, type has only methods
        const currentOperationLevel = transaction?.lastHead?.header?.level

        // refetch data we need
        await checkIndexerLevelAndRunDataUpdateCallback({
          callback: async () => {
            await dispatch(hideToaster())
            await dispatch(showToaster(TOASTER_SUCCESS, 'Operators updated.', ACTION_COMPLETION_MESSAGE_TEXT))
            await dispatch(toggleActionCompletion(false))
          },
          currentOperationLevel,
        })
      }, 5000)
    } catch (error) {
      console.error('updateOperatorsAction error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
        callback()
      }
      dispatch(toggleActionFullScreenLoader(false))
      dispatch(toggleActionCompletion(false))
    }
  }
