import { OpKind, TransactionWalletOperation } from '@taquito/taquito'
import { BatchWalletOperation } from '@taquito/taquito/dist/types/wallet/batch-operation'

import { DAPP_INSTANCE } from 'providers/UserProvider/user.provider'
import { toggleActionCompletion, toggleActionFullScreenLoader } from 'app/App.components/Loader/Loader.action'
import { hideToaster, showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { getLoansStorage } from './getLoansData.actions'

import {
  ACTION_COMPLETION_MESSAGE_TEXT,
  ACTION_START_MESSAGE_TEXT,
  TOASTER_ERROR,
  TOASTER_INFO,
  TOASTER_LOADING,
  TOASTER_SUCCESS,
  TOASTER_UPDATE_DATA_AFTER_ACTION_DATA,
} from 'app/App.components/Toaster/Toaster.constants'

import { NEW_VAULT_QUERY, NEW_VAULT_QUERY_NAME, NEW_VAULT_QUERY_VARIABLE } from 'gql/queries/getLoansStorage'

import { AppDispatch, GetState } from 'app/App.controller'
import { State } from 'reducers'

import { fetchFromIndexer } from 'gql/fetchGraphQL'
import { convertNumberForContractCall } from 'utils/calcFunctions'
import { checkIndexerLevelAndRunDataUpdateCallback } from 'utils/checkIndexerLevel/checkIndexerLevel'
import { scrollUpPage } from 'utils/scrollUpPage'
import { sleep } from 'utils/api/sleep'
import { LoansTokenMetadataType } from 'providers/TokensProvider/tokens.provider.types'

// change vault name
export const changeVaultNameAction =
  (newVaultName: string, vaultAddress: string, callback: () => void) =>
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
      const transaction = await contract.methods.initVaultAction('updateVaultName', newVaultName).send()

      // close popup
      callback()
      dispatch(toggleActionFullScreenLoader(true))
      dispatch(toggleActionCompletion(true))
      dispatch(showToaster(TOASTER_INFO, 'Changing vault name...', ACTION_START_MESSAGE_TEXT))

      await sleep(5000)

      // turn off fs actions loader and start data updating after 5s after operation started
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
          await dispatch(getLoansStorage())

          await dispatch(hideToaster())
          await dispatch(showToaster(TOASTER_SUCCESS, 'Vault name is changed.', ACTION_COMPLETION_MESSAGE_TEXT))
          await dispatch(toggleActionCompletion(false))
        },
        currentOperationLevel,
      })
    } catch (error) {
      console.error('changeVaultNameAction error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
        callback()
      }
      dispatch(toggleActionFullScreenLoader(false))
      dispatch(toggleActionCompletion(false))
    }
  }

// trigger initial vault creation to get the id of future vault
// export const triggerInitialVaultCreation =
//   (loanTokenName: string, vaultName: string) => async (dispatch: AppDispatch, getState: GetState) => {
//     const state: State = getState()
//     const userAddress = state.wallet.accountPkh

//     // check whether we can send transaction
//     if (!userAddress) {
//       await dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
//       return
//     }

//     try {
//       // prepare and send transaction
//       const tezos = await DAPP_INSTANCE.tezos()
//       const contract = await tezos.wallet.at(state.contractAddresses.vaultFactory.address)
//       const transaction = await contract?.methods.createVault(null, loanTokenName, vaultName, [], 'any').send()

//       // confirm query completion
//       await transaction?.confirmation()

//       // @ts-ignore don't have proper type to acees data, type has only methods
//       const currentOperationLevel = transaction?.lastHead?.header?.level

//       const { value } = await checkIndexerLevelAndRunDataUpdateCallback({
//         callback: async () => {
//           await dispatch(getLoansStorage())

//           const newVaultData = await fetchFromIndexer(
//             NEW_VAULT_QUERY,
//             NEW_VAULT_QUERY_NAME,
//             NEW_VAULT_QUERY_VARIABLE(userAddress, vaultName),
//           )

//           return newVaultData.vault.at(-1)?.lending_controller_vaults?.[0]?.vault?.address
//         },
//         currentOperationLevel,
//       })

//       return value
//     } catch (error) {
//       console.error('triggerInitialVaultCreation error:', error)
//       if (error instanceof Error) {
//         dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
//       }

//       return
//     }
//   }

// borrow asset from the vault
export const borrowVaultAssetAction =
  (vaultId: number, amountToBorrow: number, borrowedToken: LoansTokenMetadataType, callback: () => void) =>
  async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    // check whether we can send transaction
    if (!state.wallet.accountPkh) {
      await dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    try {
      const { decimals } = borrowedToken
      // prepare and send transaction
      const convertedAssetAmount = convertNumberForContractCall({ number: amountToBorrow, grade: decimals })
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.lendingController.address)
      const transaction = await contract?.methods.borrow(vaultId, convertedAssetAmount).send()

      // close popup
      callback()
      dispatch(toggleActionFullScreenLoader(true))
      dispatch(toggleActionCompletion(true))
      dispatch(showToaster(TOASTER_INFO, 'Borrowing from the vault...', ACTION_START_MESSAGE_TEXT))

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
            await dispatch(getLoansStorage())

            await dispatch(hideToaster())
            await dispatch(showToaster(TOASTER_SUCCESS, 'Asset borrowed.', ACTION_COMPLETION_MESSAGE_TEXT))
            await dispatch(toggleActionCompletion(false))
          },
          currentOperationLevel,
        })
      }, 5000)
    } catch (error) {
      console.error('borrowVaultAssetAction error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
        callback()
      }
      dispatch(toggleActionFullScreenLoader(false))
      dispatch(toggleActionCompletion(false))
    }
  }

// parlty repay vault
export const repayPartOfVaultAction =
  (
    vaultId: number,
    vaultAddress: string,
    repayAmount: number,
    borrowedToken: LoansTokenMetadataType,
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
      const { decimals, address, type } = borrowedToken
      // prepare and send transaction
      const convertedAssetAmount = convertNumberForContractCall({ number: repayAmount, grade: decimals })
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.lendingController.address)
      let transaction: BatchWalletOperation | TransactionWalletOperation | null = null

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

        const batch = await tezos.wallet.batch(batchArr)
        transaction = await batch.send()
      } else if (type === 'fa2') {
        const assetContract = await tezos.wallet.at(address)
        const batchArr = [
          {
            kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
            ...assetContract.methods
              .update_operators([
                {
                  add_operator: {
                    owner: state.wallet.accountPkh,
                    operator: state.contractAddresses.lendingController.address,
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
                    owner: state.wallet.accountPkh,
                    operator: state.contractAddresses.lendingController.address,
                    token_id: 0, // Should be a number, usually 0
                  },
                },
              ])
              .toTransferParams(),
          },
        ]

        const batch = await tezos.wallet.batch(batchArr)
        transaction = await batch.send()
      } else {
        transaction = await contract?.methods.repay(vaultId, convertedAssetAmount).send()
      }

      // close popup
      callback()
      dispatch(toggleActionFullScreenLoader(true))
      dispatch(toggleActionCompletion(true))
      dispatch(showToaster(TOASTER_INFO, 'Repaying asset...', ACTION_START_MESSAGE_TEXT))

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
            await dispatch(getLoansStorage())

            await dispatch(hideToaster())
            await dispatch(showToaster(TOASTER_SUCCESS, 'Asset repayed.', ACTION_COMPLETION_MESSAGE_TEXT))
            await dispatch(toggleActionCompletion(false))
          },
          currentOperationLevel,
        })
      }, 5000)
    } catch (error) {
      console.error('repayPartOfVaultAction error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
        callback()
      }
      dispatch(toggleActionFullScreenLoader(false))
      dispatch(toggleActionCompletion(false))
    }
  }

// repay full vault and close it
export const repayFullAndCloseVaultAction =
  (
    vaultId: number,
    vaultAddress: string,
    repayAmount: number,
    borrowedToken: LoansTokenMetadataType,
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
      const { decimals, address, type } = borrowedToken
      // prepare and send transaction
      const convertedAssetAmount = convertNumberForContractCall({ number: repayAmount, grade: decimals })
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.lendingController.address)
      let transaction: BatchWalletOperation | null = null

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

        const batch = await tezos.wallet.batch(batchArr)
        transaction = await batch.send()
      } else if (type === 'fa2') {
        const assetContract = await tezos.wallet.at(address)
        const batchArr = [
          {
            kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
            ...assetContract.methods
              .update_operators([
                {
                  add_operator: {
                    owner: state.wallet.accountPkh,
                    operator: state.contractAddresses.lendingController.address,
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
                    owner: state.wallet.accountPkh,
                    operator: state.contractAddresses.lendingController.address,
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

        const batch = await tezos.wallet.batch(batchArr)
        transaction = await batch.send()
      } else {
        transaction = await tezos.wallet
          .batch([
            {
              kind: OpKind.TRANSACTION,
              ...contract?.methods.repay(vaultId, convertedAssetAmount).toTransferParams(),
            },
            {
              kind: OpKind.TRANSACTION,
              ...contract.methods.closeVault(vaultId).toTransferParams(),
            },
          ])
          .send()
      }

      // close popup
      callback()
      dispatch(toggleActionFullScreenLoader(true))
      dispatch(toggleActionCompletion(true))
      dispatch(showToaster(TOASTER_INFO, 'Repaying asset...', ACTION_START_MESSAGE_TEXT))

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
            await dispatch(getLoansStorage())

            await dispatch(hideToaster())
            await dispatch(showToaster(TOASTER_SUCCESS, 'Asset repayed.', ACTION_COMPLETION_MESSAGE_TEXT))
            await dispatch(toggleActionCompletion(true))
          },
          currentOperationLevel,
        })
      }, 5000)

      // scroll up to top of page, after closing vault
      scrollUpPage()
    } catch (error) {
      console.error('repayFullAndCloseVaultAction error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
        callback()
      }
      dispatch(toggleActionFullScreenLoader(false))
      dispatch(toggleActionCompletion(false))
    }
  }
