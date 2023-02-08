import { AppDispatch, coinGeckoClient, GetState } from 'app/App.controller'
import { normalizeDipDupContracts, normalizeDipDupTokens, normalizeMTokens } from 'app/App.helpers'
import { fetchFromIndexer } from 'gql/fetchGraphQL'
import {
  DIPDUP_CONTRACTS_QUERY,
  DIPDUP_CONTRACTS_QUERY_NAME,
  DIPDUP_CONTRACTS_QUERY_VARIABLE,
  DIPDUP_TOKENS_QUERY,
  DIPDUP_TOKENS_QUERY_NAME,
  DIPDUP_TOKENS_QUERY_VARIABLE,
  GOVERNANCE_CONTRACT_ADDRESS_NAME,
  GOVERNANCE_CONTRACT_ADDRESS_QUERY,
  GOVERNANCE_CONTRACT_ADDRESS_VARIABLE,
  M_TOKENS_QUERY,
  M_TOKENS_QUERY_NAME,
  WHITELIST_TOKENS_NAME,
  WHITELIST_TOKENS_QUERY,
  WHITELIST_TOKENS_VARIABLE,
} from 'gql/queries/getTokensData'
import { State } from 'reducers'

export const GET_DIP_DUP_TOKENS = 'GET_DIP_DUP_TOKENS'
export const getDipDupTokensStorage = () => async (dispatch: AppDispatch, getState: GetState) => {
  try {
    const storageTokens = await fetchFromIndexer(
      DIPDUP_TOKENS_QUERY,
      DIPDUP_TOKENS_QUERY_NAME,
      DIPDUP_TOKENS_QUERY_VARIABLE,
    )
    const dipDupTokens = normalizeDipDupTokens(storageTokens)

    const storageContracts = await fetchFromIndexer(
      DIPDUP_CONTRACTS_QUERY,
      DIPDUP_CONTRACTS_QUERY_NAME,
      DIPDUP_CONTRACTS_QUERY_VARIABLE,
    )
    const dipDupContracts = normalizeDipDupContracts(storageContracts)

    dispatch({
      type: GET_DIP_DUP_TOKENS,
      dipDupTokens,
      dipDupContracts,
    })
  } catch (e) {
    console.error('getDipDupTokensStorage error: ', e)
  }
}

export const GET_WHITELIST_TOKENS = 'GET_WHITELIST_TOKENS'
export const getWhitelistTokensStorage = () => async (dispatch: AppDispatch, getState: GetState) => {
  try {
    const govContract = await fetchFromIndexer(
      GOVERNANCE_CONTRACT_ADDRESS_QUERY,
      GOVERNANCE_CONTRACT_ADDRESS_NAME,
      GOVERNANCE_CONTRACT_ADDRESS_VARIABLE,
    )

    const address = govContract?.governance?.[0]?.general_contracts?.[0]?.contract_address

    if (!address) {
      throw new Error('No active governance contract')
    }

    const storage = await fetchFromIndexer(
      WHITELIST_TOKENS_QUERY,
      WHITELIST_TOKENS_NAME,
      WHITELIST_TOKENS_VARIABLE(address),
    )

    const whitelistTokens = storage?.treasury?.[0]?.whitelist_token_contracts ?? []

    dispatch({
      type: GET_WHITELIST_TOKENS,
      whitelistTokens,
    })
  } catch (e) {
    console.error('getWhitelistTokensStorage error: ', e)
  }
}

export const GET_TOKENS_PRICES = 'GET_TOKENS_PRICES'
export const getTokensPrices = () => async (dispatch: any) => {
  try {
    const tokensInfoFromCoingecko = await coinGeckoClient.simple.price({
      ids: ['tezos', 'tzbtc'],
      vs_currencies: ['usd'],
    })

    dispatch({
      type: GET_TOKENS_PRICES,
      tokensPrices: tokensInfoFromCoingecko.data,
    })
  } catch (e) {
    console.error('getTokensPrices error: ', e)
  }
}

export const GET_M_TOKENS = 'GET_M_TOKENS'
export const getMTokensStorage = () => async (dispatch: AppDispatch, getState: GetState) => {
  try {
    const storage = await fetchFromIndexer(M_TOKENS_QUERY, M_TOKENS_QUERY_NAME, {})
    const mTokens = normalizeMTokens(storage)

    dispatch({
      type: GET_M_TOKENS,
      mTokens,
    })
  } catch (e) {
    console.error('getMTokensStorage error: ', e)
  }
}

export const fetchRateBySymbols = async (tokensSymbols: Array<string>) => {
  try {
    return await (
      await Promise.all(tokensSymbols.map((symbol) => coinGeckoClient.coins.fetch(symbol, {})))
    ).reduce<Record<string, { usd: number }>>((acc, promiseResult, idx) => {
      if (promiseResult?.success && promiseResult?.code === 200) {
        // TODO: extract this, and consider use id instead of symbol
        const symbol = promiseResult.data.symbol === 'xtz' ? 'tezos' : promiseResult.data.symbol
        const rate = promiseResult.data.market_data.current_price.usd
        acc[symbol] = { usd: rate }
      } else {
        acc[tokensSymbols[idx]] = { usd: 0.25 }
      }

      return acc
    }, {})
  } catch (e) {
    console.log('fetchRateBySymbols error: ', e)
    return {}
  }
}
