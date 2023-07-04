import { BatchWalletOperation } from '@taquito/taquito/dist/types/wallet/batch-operation'
import { OpKind, TransactionWalletOperation } from '@taquito/taquito'

import { DAPP_INSTANCE } from 'providers/UserProvider/user.provider'
import { toggleActionCompletion, toggleActionFullScreenLoader } from 'app/App.components/Loader/Loader.action'
import { getLoansStorage } from './getLoansData.actions'
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

import { AppDispatch, GetState } from 'app/App.controller'
import { State } from 'reducers'

import { convertNumberForContractCall } from 'utils/calcFunctions'
import { checkIndexerLevelAndRunDataUpdateCallback } from 'utils/checkIndexerLevel/checkIndexerLevel'
import { LoansTokenMetadataType } from 'providers/TokensProvider/tokens.provider.types'

export const depositLendingAssetAction =
  (loanToken: LoansTokenMetadataType, addLiquidityAmount: number, callback: () => void) =>
  async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    // check whether we can send transaction
    if (!state.wallet.accountPkh) {
      await dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

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
      const contract = await tezos.wallet.at(state.contractAddresses.lendingController.address)
      let transaction: TransactionWalletOperation | BatchWalletOperation | null = null

      if (type === 'tez') {
        transaction = await contract?.methods
          .addLiquidity(indexerName, convertedAssetAmount)
          .send({ amount: convertedAssetAmount, mutez: true })
      } else if (type === 'fa12') {
        const assetContract = await tezos.wallet.at(address)
        const batch = await tezos.wallet.batch([
          {
            kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
            ...assetContract.methods.approve(state.contractAddresses.lendingController.address, 0).toTransferParams(),
          },
          {
            kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
            ...assetContract.methods
              .approve(state.contractAddresses.lendingController.address, convertedAssetAmount)
              .toTransferParams(),
          },
          {
            kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
            ...contract?.methods.addLiquidity(convertedAssetAmount, indexerName).toTransferParams(),
          },
        ])
        transaction = await batch.send()
      } else {
        const assetContract = await tezos.wallet.at(address)
        const batch = await tezos.wallet.batch([
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
            ...contract.methods.addLiquidity(indexerName, convertedAssetAmount).toTransferParams(),
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
        ])
        transaction = await batch.send()
      }

      // close popup
      callback()
      dispatch(toggleActionFullScreenLoader(true))
      dispatch(toggleActionCompletion(true))
      dispatch(showToaster(TOASTER_INFO, 'Adding liquidity...', ACTION_START_MESSAGE_TEXT))

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
            await dispatch(showToaster(TOASTER_SUCCESS, 'Liquidity added.', ACTION_COMPLETION_MESSAGE_TEXT))
            await dispatch(toggleActionCompletion(false))
          },
          currentOperationLevel,
        })
      }, 5000)
    } catch (error) {
      console.error('depositLendingAssetAction error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
        callback()
      }
      dispatch(toggleActionFullScreenLoader(false))
      dispatch(toggleActionCompletion(false))
    }
  }

export const withdrawLendingAssetAction =
  (removeLiquidityAmount: number, loanToken: LoansTokenMetadataType, callback: () => void) =>
  async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    // check whether we can send transaction
    if (!state.wallet.accountPkh) {
      await dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    try {
      const {
        decimals,
        loanData: { indexerName },
      } = loanToken
      // prepare and send transaction
      const convertedAssetAmount = convertNumberForContractCall({ number: removeLiquidityAmount, grade: decimals })
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.lendingController.address)
      const transaction = await contract?.methods.removeLiquidity(indexerName, convertedAssetAmount).send()

      // close popup
      callback()
      dispatch(toggleActionFullScreenLoader(true))
      dispatch(toggleActionCompletion(true))
      dispatch(showToaster(TOASTER_INFO, 'Removing liquidity...', ACTION_START_MESSAGE_TEXT))

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
            await dispatch(showToaster(TOASTER_SUCCESS, 'Liquidity removed.', ACTION_COMPLETION_MESSAGE_TEXT))
            await dispatch(toggleActionCompletion(false))
          },
          currentOperationLevel,
        })
      }, 5000)
    } catch (error) {
      console.error('withdrawLendingAssetAction error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
        callback()
      }
      dispatch(toggleActionFullScreenLoader(false))
      dispatch(toggleActionCompletion(false))
    }
  }
