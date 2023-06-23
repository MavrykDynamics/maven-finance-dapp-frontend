import { toggleActionCompletion, toggleActionFullScreenLoader } from 'app/App.components/Loader/Loader.action'
import { DAPP_INSTANCE } from 'app/App.components/ConnectWallet/ConnectWallet.actions'
import { getLoansStorage } from 'pages/Loans/Actions/getLoansData.actions'
import { hideToaster, showToaster } from 'app/App.components/Toaster/Toaster.actions'

import { convertNumberForContractCall } from 'utils/calcFunctions'
import { checkIndexerLevelAndRunDataUpdateCallback } from 'utils/checkIndexerLevel/checkIndexerLevel'

import { AppDispatch, GetState } from '../../app/App.controller'
import { State } from 'reducers'

import {
  ACTION_COMPLETION_MESSAGE_TEXT,
  ACTION_START_MESSAGE_TEXT,
  TOASTER_ERROR,
  TOASTER_INFO,
  TOASTER_LOADING,
  TOASTER_SUCCESS,
  TOASTER_UPDATE_DATA_AFTER_ACTION_DATA,
} from 'app/App.components/Toaster/Toaster.constants'

// Liquidate Vault
export const liquidateVault =
  ({
    vaultId,
    vaultOwner,
    liquidateAmount,
    decimals,
  }: {
    vaultId: number
    vaultOwner: string
    liquidateAmount: number
    decimals: number
  }) =>
  async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    if (!state.wallet.accountPkh) {
      await dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    try {
      // prepare and send transaction
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.lendingController.address)
      const transaction = await contract?.methods
        .liquidateVault(vaultId, vaultOwner, convertNumberForContractCall({ number: liquidateAmount, grade: decimals }))
        .send()

      dispatch(toggleActionFullScreenLoader(true))
      dispatch(toggleActionCompletion(true))
      dispatch(showToaster(TOASTER_INFO, 'Liquidating vault...', ACTION_START_MESSAGE_TEXT))

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

            // Add here call for update data actions
            await dispatch(hideToaster())
            await dispatch(showToaster(TOASTER_SUCCESS, 'Vault Liquidated', ACTION_COMPLETION_MESSAGE_TEXT))
            await dispatch(toggleActionCompletion(false))
          },
          currentOperationLevel,
        })
      }, 5000)
    } catch (error) {
      if (error instanceof Error) {
        console.error('liquidateVault - TOASTER_ERROR ', error)
        dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
      }
      dispatch(toggleActionFullScreenLoader(false))
      dispatch(toggleActionCompletion(false))
    }
  }

// Mark for Liquidation
export const markForLiquidation =
  (vaultId: number, vaultOwner: string) => async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    if (!state.wallet.accountPkh) {
      await dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    try {
      // prepare and send transaction
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.lendingController.address)
      const transaction = await contract?.methods.markForLiquidation(vaultId, vaultOwner).send()

      dispatch(toggleActionFullScreenLoader(true))
      dispatch(toggleActionCompletion(true))
      dispatch(showToaster(TOASTER_INFO, 'Marking vault for Liquidation...', ACTION_START_MESSAGE_TEXT))

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
            // Add here call for update data actions
            await dispatch(hideToaster())
            await dispatch(showToaster(TOASTER_SUCCESS, 'Vault marked for Liquidation', ACTION_COMPLETION_MESSAGE_TEXT))
            await dispatch(toggleActionCompletion(false))
          },
          currentOperationLevel,
        })
      }, 5000)
    } catch (error) {
      if (error instanceof Error) {
        console.error('markForLiquidation - TOASTER_ERROR ', error)
        dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
      }
      dispatch(toggleActionFullScreenLoader(false))
      dispatch(toggleActionCompletion(false))
    }
  }
