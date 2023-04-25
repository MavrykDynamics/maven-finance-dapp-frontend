import { toggleActionCompletion, toggleActionFullScreenLoader } from 'app/App.components/Loader/Loader.action'
import { getHeadData } from 'app/App.components/Menu/Menu.actions'
import { DAPP_INSTANCE } from 'app/App.components/ConnectWallet/ConnectWallet.actions'
import { getLoansStorage } from 'pages/Loans/Actions/getLoansData.actions'
import { hideToaster, showToaster } from 'app/App.components/Toaster/Toaster.actions'

import { normalizeVaultsStorage, normalizeOracleLatestPrice } from './Vaults.helpers'
import { convertNumberForContractCall } from 'utils/calcFunctions'
import { checkIndexerLevelAndRunDataUpdateCallback } from 'utils/checkIndexerLevel/checkIndexerLevel'
import { getOracleLatestPrices } from './Vaults.helpers'
import { fetchFromIndexer } from 'gql/fetchGraphQL'

import { AppDispatch, GetState } from '../../app/App.controller'
import { LendingControllerGQL } from 'utils/TypesAndInterfaces/Vaults'
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
import {
  VAULTS_STORAGE_QUERY_NAME,
  VAULTS_STORAGE_QUERY_VARIABLE,
  VAULTS_STORAGE_QUERY,
  ORACLE_AGGREGATOR_LATEST_PRICE_QUERY,
  ORACLE_AGGREGATOR_LATEST_PRICE_QUERY_NAME,
  ORACLE_AGGREGATOR_LATEST_PRICE_QUERY_VARIABLE,
} from 'gql/queries/getVaultsStorage'

// Vaults Store
export const GET_VAULTS_STORAGE = 'GET_VAULTS_STORAGE'
export const getVaultsStorage = () => async (dispatch: AppDispatch, getState: GetState) => {
  try {
    const storage = await fetchFromIndexer(
      VAULTS_STORAGE_QUERY,
      VAULTS_STORAGE_QUERY_NAME,
      VAULTS_STORAGE_QUERY_VARIABLE,
    )
    const lendingController: LendingControllerGQL = storage?.lending_controller[0] || {}

    const [, oracleLatestPrices] = await Promise.all([
      dispatch(getHeadData()),
      getOracleLatestPrices(lendingController.vaults),
    ])

    const {
      tokens: { dipDupTokens },
      wallet: { accountPkh },
      dataFeeds: { feedsLedger },
    } = getState()

    const normallaziedVaultsStorage = await normalizeVaultsStorage({
      accountPkh,
      dipDupTokens,
      feeds: feedsLedger,
      oracleLatestPrices,
      lendingController,
    })

    dispatch({
      type: GET_VAULTS_STORAGE,
      vaultsList: normallaziedVaultsStorage,
    })
  } catch (e) {
    console.error('getVaultsStorage error: ', e)
  }
}

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
            state.vaults.isLoaded && (await dispatch(getVaultsStorage()))
            state.loans.isDataLoaded && (await dispatch(getLoansStorage()))

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
    }
  }

// Oracle Latest Price
export const getOracleAggregatorLatestPrice = async (oracleId: string) => {
  try {
    const storage = await fetchFromIndexer(
      ORACLE_AGGREGATOR_LATEST_PRICE_QUERY,
      ORACLE_AGGREGATOR_LATEST_PRICE_QUERY_NAME,
      ORACLE_AGGREGATOR_LATEST_PRICE_QUERY_VARIABLE(oracleId),
    )

    const oracleLatestPrice = normalizeOracleLatestPrice(storage)
    return oracleLatestPrice
  } catch (e) {
    console.error('getOracleAggregatorLatestPrice error: ', e)
    return null
  }
}
