import { AppDispatch, GetState } from 'app/App.controller'
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
import { convertNumberForClient } from 'utils/calcFunctions'
import { getSymbolFromFeedName } from 'utils/parse'

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
export const getTokensPrices = () => async (dispatch: AppDispatch, getState: GetState) => {
  const {
    dataFeeds: { feedsLedger },
  } = getState()
  try {
    const tokenPricesFromFeeds = feedsLedger.reduce<State['tokens']['tokensPrices']>(
      (acc, { name, last_completed_data, decimals }) => {
        const assetSymbol = getSymbolFromFeedName(name)
        const rate = convertNumberForClient({ number: last_completed_data, grade: decimals })
        acc[assetSymbol] = rate
        return acc
      },
      {},
    )

    dispatch({
      type: GET_TOKENS_PRICES,
      tokensPrices: tokenPricesFromFeeds,
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
