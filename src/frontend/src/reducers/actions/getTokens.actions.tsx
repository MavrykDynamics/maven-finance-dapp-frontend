import { AppDispatch, GetState } from 'app/App.controller'

import { fetchFromIndexer } from 'gql/fetchGraphQL'
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
} from 'gql/queries/getTokensData'

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

    const dipDupTokensStorage = storageTokens.dipdup_token_metadata
    const whitelistTokensStorage = storageTokens.treasury
    const mTokensStorage = storageTokens.m_token

    const dipDupTokens = normalizeDipDupTokens(dipDupTokensStorage)
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
