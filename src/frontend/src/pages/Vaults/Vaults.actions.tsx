import { AppDispatch, coinGeckoClient, GetState } from '../../app/App.controller'
import { fetchFromIndexer } from 'gql/fetchGraphQL'
import {
  VAULTS_STORAGE_QUERY_NAME,
  VAULTS_STORAGE_QUERY_VARIABLE,
  VAULTS_STORAGE_QUERY,
} from 'gql/queries/getVaultsStorage'
import { normalizeVaultsStorage, getVaultTokensSymbols } from './Vaults.helpers'

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

    const { vault = [] } = storage

    // const test = getVaultTokensSymbols({ vaults: vault, dipDupTokens })

    // fetching rate of the presented tokens insisde loans
    const vaultsTokensRate = (
      await Promise.allSettled(
        getVaultTokensSymbols({ vaults: vault, dipDupTokens }).map(
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

    const normallaziedVaultsStorage = normalizeVaultsStorage({ vault, accountPkh, vaultsTokensRate, dipDupTokens })

    dispatch({
      type: GET_VAULTS_STORAGE,
      vaultsList: normallaziedVaultsStorage,
    })
  } catch (e) {
    console.error('getVaultsStorage error: ', e)
  }
}
