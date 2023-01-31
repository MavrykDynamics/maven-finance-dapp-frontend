import { AppDispatch, GetState } from '../../app/App.controller'
import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from 'app/App.components/Toaster/Toaster.constants'
import { State } from 'reducers'
import { toggleActionLoader } from 'app/App.components/Loader/Loader.action'
import { fetchFromIndexer } from 'gql/fetchGraphQL'
import {
  VAULTS_STORAGE_QUERY_NAME,
  VAULTS_STORAGE_QUERY_VARIABLE,
  VAULTS_STORAGE_QUERY,
  ORACLE_AGGREGATOR_LATEST_PRICE_QUERY,
  ORACLE_AGGREGATOR_LATEST_PRICE_QUERY_NAME,
  ORACLE_AGGREGATOR_LATEST_PRICE_QUERY_VARIABLE,
} from 'gql/queries/getVaultsStorage'
import { normalizeVaultsStorage, normalizeOracleLatestPrice, getVaultsTokensRates } from './Vaults.helpers'
import { LendingControllerGQL } from 'utils/TypesAndInterfaces/Vaults'
import { setContractAddress } from 'reducers/actions/contractAddresses.actions'
import { getHeadData } from 'app/App.components/Menu/Menu.actions'
import { getOracleLatestPrices } from './Vaults.helpers'
import { updateTokensPrices } from 'reducers/actions/dipDupActions.actions'

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
      tokens: { dipDupTokens, tokensPrices },
      wallet: { accountPkh },
      preferences: { headData },
      oracles: {
        oraclesStorage: { feeds },
      },
    } = getState()

    const vaultsTokensRate = await getVaultsTokensRates(lendingController.vaults, dipDupTokens, tokensPrices)

    const normallaziedVaultsStorage = await normalizeVaultsStorage({
      accountPkh,
      dipDupTokens,
      feeds,
      oracleLatestPrices,
      currentBlockLevel: headData?.level,
      lendingController,
    })

    dispatch(setContractAddress('vaultAddress', lendingController.address))
    dispatch(updateTokensPrices(vaultsTokensRate))

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
  (vaultId: number, vaultOwner: string, liquidateAmount: number) =>
  async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    if (!state.wallet.accountPkh) {
      dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    if (state.loading.isActionLoading) {
      dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
      return
    }

    try {
      dispatch(toggleActionLoader(true))
      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.vaultAddress.address)
      const transaction = await contract?.methods.liquidateVault(vaultId, vaultOwner, liquidateAmount).send()
      dispatch(showToaster(INFO, 'Liqudation...', 'Please wait 30s'))

      await transaction?.confirmation()

      dispatch(showToaster(SUCCESS, 'Liqudation is done', 'All good :)'))
      dispatch(toggleActionLoader(false))
    } catch (error) {
      if (error instanceof Error) {
        console.error('liquidateVault - ERROR ', error)
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      dispatch(toggleActionLoader(false))
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

    if (state.loading.isActionLoading) {
      dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
      return
    }

    try {
      dispatch(toggleActionLoader(true))
      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.vaultAddress.address)
      const transaction = await contract?.methods.markForLiquidation(vaultId, vaultOwner).send()
      dispatch(showToaster(INFO, 'Mark for Liquidation...', 'Please wait 30s'))

      await transaction?.confirmation()

      dispatch(showToaster(SUCCESS, 'Mark for Liquidation is done', 'All good :)'))
      dispatch(toggleActionLoader(false))
    } catch (error) {
      if (error instanceof Error) {
        console.error('markForLiquidation - ERROR ', error)
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      dispatch(toggleActionLoader(false))
    }
  }

// Oracle Latest Price
export const getOracleAggregatorLatestPrice = async (oracleId: string) => {
  // TODO: use oracleID in ORACLE_AGGREGATOR_LATEST_PRICE_QUERY_VARIABLE
  try {
    const storage = await fetchFromIndexer(
      ORACLE_AGGREGATOR_LATEST_PRICE_QUERY,
      ORACLE_AGGREGATOR_LATEST_PRICE_QUERY_NAME,
      ORACLE_AGGREGATOR_LATEST_PRICE_QUERY_VARIABLE,
    )

    const oracleLatestPrice = normalizeOracleLatestPrice(storage)
    return oracleLatestPrice
  } catch (e) {
    console.error('getOracleAggregatorLatestPrice error: ', e)
    return null
  }
}
