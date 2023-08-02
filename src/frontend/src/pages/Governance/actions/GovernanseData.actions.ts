// import { AppDispatch, GetState } from 'app/App.controller'

// import { fetchFromIndexer } from 'gql/fetchGraphQL'
// import { normalizeGovernanceConfig, normalizeGovernanceProposals } from './governanceNormalizers'

// export const GET_PROPOSALS = 'GET_PROPOSALS'
// export const GET_GOVERNANCE_CONFIG = 'GET_GOVERNANCE_CONFIG'
// export const getGovernanceStorage = () => async (dispatch: AppDispatch, getState: GetState) => {
//   try {
//     const [configStorage, proposalStorage] = await Promise.all([
//       fetchFromIndexer(GOVERNANCE_CONFIG_QUERY, GOVERNANCE_CONFIG_QUERY_NAME, GOVERNANCE_CONFIG_QUERY_VARIABLE),
//       fetchFromIndexer(
//         GOVERNANCE_PROPOSALS_QUERY,
//         GOVERNANCE_PROPOSALS_QUERY_NAME,
//         GOVERNANCE_PROPOSALS_QUERY_VARIABLE,
//       ),
//     ])

//     const currentGov = configStorage.governance?.[0]
//     const normalizedConfig = normalizeGovernanceConfig(currentGov)

//     const proposalsFromGql = proposalStorage.governance_proposal
//     const normalizedProposals = normalizeGovernanceProposals(proposalsFromGql, normalizedConfig)

//     dispatch({
//       type: GET_PROPOSALS,
//       proposals: normalizedProposals,
//     })

//     dispatch({
//       type: GET_GOVERNANCE_CONFIG,
//       config: normalizedConfig,
//     })
//   } catch (e) {
//     console.error('getGovernanceStorage error: ', e)
//   }
// }
