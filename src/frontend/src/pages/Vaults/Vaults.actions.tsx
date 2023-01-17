import { AppDispatch, coinGeckoClient, GetState } from '../../app/App.controller'
import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from 'app/App.components/Toaster/Toaster.constants'
import { State } from 'reducers'
import { toggleActionLoader } from 'app/App.components/Loader/Loader.action'
import { fetchFromIndexer } from 'gql/fetchGraphQL'
import {
  VAULTS_STORAGE_QUERY_NAME,
  VAULTS_STORAGE_QUERY_VARIABLE,
  VAULTS_STORAGE_QUERY,
} from 'gql/queries/getVaultsStorage'
import { normalizeVaultsStorage, getVaultTokensSymbols } from './Vaults.helpers'
import { LendingControllerGQL } from 'utils/TypesAndInterfaces/Vaults'

export const GET_VAULTS_STORAGE = 'GET_VAULTS_STORAGE'
export const getVaultsStorage = () => async (dispatch: AppDispatch, getState: GetState) => {
  const {
    tokens: { dipDupTokens },
    wallet: { accountPkh },
  } = getState()

  try {
    const storage = await fetchFromIndexer(
      VAULTS_STORAGE_QUERY,
      VAULTS_STORAGE_QUERY_NAME,
      VAULTS_STORAGE_QUERY_VARIABLE,
    )

    const vaults: LendingControllerGQL  = storage?.lending_controller[0] || {}

    // fetching rate of the presented tokens insisde loans
    const vaultsTokensRate = (
      await Promise.allSettled(
        getVaultTokensSymbols({ vaults: vaults.vaults, dipDupTokens }).map(
          (symbol) => coinGeckoClient.coins.fetch(symbol, {}),
        ),
      )
    ).reduce<Record<string, number>>((acc, promiseResult) => {
      const {
        value: { data, success },
      } = promiseResult as any
      if (success) {
        const symbol = data.symbol === 'xtz' ? 'tez' : data.symbol
        const rate = data.market_data.current_price.usd
        acc[symbol] = rate
      }

      return acc
    }, {})
    
    const normallaziedVaultsStorage = normalizeVaultsStorage({ vault: vaults.vaults, accountPkh, vaultsTokensRate, dipDupTokens })
    
    dispatch({
      type: GET_VAULTS_STORAGE,
      vaultsList: normallaziedVaultsStorage,
    })
  } catch (e) {
    console.error('getVaultsStorage error: ', e)
  }
}

// Liquidate Vault
export const liquidateVault = (vaultId: string, vaultOwner: string, liquidateAmount: number) => async (dispatch: AppDispatch, getState: GetState) => {
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
    // TODO: add valid contract address
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.vaultsAddress.address)
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
export const markForLiquidation = (vaultId: string, vaultOwner: string) => async (dispatch: AppDispatch, getState: GetState) => {
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
    // TODO: add valid contract address
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.vaultsAddress.address)
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