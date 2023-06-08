import { State } from 'reducers'
import { AppDispatch, GetState } from 'app/App.controller'

import { getSymbolAndNameFromFeedName } from 'utils/parse'
import { fetchFromIndexer } from 'gql/fetchGraphQL'
import { convertNumberForClient } from 'utils/calcFunctions'
import {
  normalizeDipDupTokens,
  normalizeMTokens,
  normalizeWhitelistTokens,
} from 'utils/normalizers/DAPPTokens.normalizers'

import {
  DAPP_TOKENS_QUERY,
  DAPP_TOKENS_QUERY_NAME,
  DAPP_TOKENS_VARIABLE,
  GOVERNANCE_CONTRACT_ADDRESS_NAME,
  GOVERNANCE_CONTRACT_ADDRESS_QUERY,
  GOVERNANCE_CONTRACT_ADDRESS_VARIABLE,
  MVK_FAUCET_QUERY,
  MVK_FAUCET_QUERY_NAME,
} from 'gql/queries/getTokensData'

export const GET_MVK_FAUCET = 'GET_MVK_FAUCET'
export const getMvkFaucet = () => async (dispatch: AppDispatch, getState: GetState) => {
  try {
    const mvkFaucetResponce = await fetchFromIndexer(MVK_FAUCET_QUERY, MVK_FAUCET_QUERY_NAME, {})

    dispatch({
      type: GET_MVK_FAUCET,
      mvkFaucet: mvkFaucetResponce?.[0]?.address ?? null,
    })
  } catch (e) {
    console.error('getMvkFaucet error: ', e)
  }
}

export const GET_DAPP_TOKENS = 'GET_DAPP_TOKENS'
export const getTokensForDAPP = () => async (dispatch: AppDispatch, getState: GetState) => {
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

    const storageTokens = await fetchFromIndexer(
      DAPP_TOKENS_QUERY,
      DAPP_TOKENS_QUERY_NAME,
      DAPP_TOKENS_VARIABLE(address),
    )

    const dipDupTokensStorage = storageTokens.token
    const whitelistTokensStorage = storageTokens.treasury
    const mTokensStorage = storageTokens.m_token

    const dipDupTokens = normalizeDipDupTokens(dipDupTokensStorage)
    console.log({ dipDupTokens, dipDupTokensStorage })
    const mTokens = normalizeMTokens(mTokensStorage)
    const whitelistTokens = normalizeWhitelistTokens(whitelistTokensStorage)

    dispatch({
      type: GET_DAPP_TOKENS,
      dipDupTokens,
      whitelistTokens,
      mTokens,
    })
  } catch (e) {
    console.error('getTokensForDAPP error: ', e)
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
        const assetSymbol = getSymbolAndNameFromFeedName(name).symbol
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
