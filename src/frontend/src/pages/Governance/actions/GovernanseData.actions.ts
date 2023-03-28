import { AppDispatch, GetState } from 'app/App.controller'

import {
  GOVERNANCE_CONFIG_QUERY,
  GOVERNANCE_CONFIG_QUERY_NAME,
  GOVERNANCE_CONFIG_QUERY_VARIABLE,
  GOVERNANCE_PROPOSALS_QUERY,
  GOVERNANCE_PROPOSALS_QUERY_NAME,
  GOVERNANCE_PROPOSALS_QUERY_VARIABLE,
} from 'gql/queries'

import { fetchFromIndexer } from 'gql/fetchGraphQL'
import { normalizeGovernanceConfig, normalizeGovernanceProposals } from '../Governance.helpers'

export const GET_GOVERNANCE_CONFIG = 'GET_GOVERNANCE_CONFIG'
export const getGovernanceConfig = () => async (dispatch: AppDispatch, getState: GetState) => {
  try {
    const storage = await fetchFromIndexer(
      GOVERNANCE_CONFIG_QUERY,
      GOVERNANCE_CONFIG_QUERY_NAME,
      GOVERNANCE_CONFIG_QUERY_VARIABLE,
    )

    const currentGov = storage.governance?.[0]
    const config = normalizeGovernanceConfig(currentGov)

    dispatch({
      type: GET_GOVERNANCE_CONFIG,
      config,
    })
  } catch (e) {
    console.error('getGovernanceStorage error: ', e)
  }
}

export const GET_PROPOSALS = 'GET_PROPOSALS'
export const getGovernanceProposals = () => async (dispatch: AppDispatch, getState: GetState) => {
  const { dipDupTokens } = getState().tokens
  try {
    const storage = await fetchFromIndexer(
      GOVERNANCE_PROPOSALS_QUERY,
      GOVERNANCE_PROPOSALS_QUERY_NAME,
      GOVERNANCE_PROPOSALS_QUERY_VARIABLE,
    )

    console.log({ storage })
    const proposalsFromGql = storage.governance_proposal
    const proposals = normalizeGovernanceProposals(proposalsFromGql, dipDupTokens)

    dispatch({
      type: GET_PROPOSALS,
      proposals,
    })
  } catch (e) {
    console.error('getGovernanceStorage error: ', e)
  }
}
