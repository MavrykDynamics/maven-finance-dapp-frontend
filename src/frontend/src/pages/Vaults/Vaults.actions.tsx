import { AppDispatch, GetState } from '../../app/App.controller'
import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from 'app/App.components/Toaster/Toaster.constants'
import { State } from 'reducers'
import { toggleActionFullScreenLoader } from 'app/App.components/Loader/Loader.action'
import { fetchFromIndexer } from 'gql/fetchGraphQL'
import {
  VAULTS_STORAGE_QUERY_NAME,
  VAULTS_STORAGE_QUERY_VARIABLE,
  VAULTS_STORAGE_QUERY,
  ORACLE_AGGREGATOR_LATEST_PRICE_QUERY,
  ORACLE_AGGREGATOR_LATEST_PRICE_QUERY_NAME,
  ORACLE_AGGREGATOR_LATEST_PRICE_QUERY_VARIABLE,
} from 'gql/queries/getVaultsStorage'
import { normalizeVaultsStorage, normalizeOracleLatestPrice } from './Vaults.helpers'
import { LendingControllerGQL } from 'utils/TypesAndInterfaces/Vaults'
import { getHeadData } from 'app/App.components/Menu/Menu.actions'
import { getOracleLatestPrices } from './Vaults.helpers'
import { convertNumberForContractCall } from 'utils/calcFunctions'
import { DAPP_INSTANCE } from 'app/App.components/ConnectWallet/ConnectWallet.actions'

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
      dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    if (state.loading.isActionActive) {
      dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
      return
    }

    try {
      dispatch(toggleActionFullScreenLoader(true))
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.lendingController.address)
      const transaction = await contract?.methods
        .liquidateVault(vaultId, vaultOwner, convertNumberForContractCall({ number: liquidateAmount, grade: decimals }))
        .send()
      dispatch(showToaster(INFO, 'Liquidating vault...', 'Please wait 30s'))

      await transaction?.confirmation()

      dispatch(showToaster(SUCCESS, 'Vault Liquidated', 'All good :)'))
      dispatch(toggleActionFullScreenLoader(false))
    } catch (error) {
      if (error instanceof Error) {
        console.error('liquidateVault - ERROR ', error)
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      dispatch(toggleActionFullScreenLoader(false))
    }
  }

// Mark for Liquidation
export const markForLiquidation =
  (vaultId: number, vaultOwner: string) => async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    if (!state.wallet.accountPkh) {
      dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    if (state.loading.isActionActive) {
      dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
      return
    }

    try {
      dispatch(toggleActionFullScreenLoader(true))
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.lendingController.address)
      const transaction = await contract?.methods.markForLiquidation(vaultId, vaultOwner).send()
      dispatch(showToaster(INFO, 'Marking vault for Liquidation...', 'Please wait 30s'))

      await transaction?.confirmation()

      dispatch(showToaster(SUCCESS, 'Vault marked for Liquidation', 'All good :)'))
      dispatch(toggleActionFullScreenLoader(false))
    } catch (error) {
      if (error instanceof Error) {
        console.error('markForLiquidation - ERROR ', error)
        dispatch(showToaster(ERROR, 'Error', error.message))
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
