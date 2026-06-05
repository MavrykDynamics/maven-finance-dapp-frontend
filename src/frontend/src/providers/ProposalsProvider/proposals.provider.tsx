import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { usePrevious } from 'react-use'

// hooks
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useQueryProvider } from 'providers/QueryProvider/query.provider'
import { useGraphQLQuery, useGraphQLQueryOnce, CACHE_STATIC } from 'providers/QueryProvider/useGraphQLQuery'

// helpers
import { normalizeGovernanceConfig, normalizeSmallGovernanceConfig } from './helpers/governanceConfig.normalizer'
import { getProposalsProviderReturnValue } from './helpers/proposals.utils'
import { normalizeProposals } from './helpers/proposals.normalizer'

// types
import { ProposalsContext, NullableProposalsContextState, ProposalsSubsRecordType } from './proposals.provider.types'

// consts
import {
  CURRENT_PROPOSALS_QUERY,
  PAST_PROPOSALS_QUERY,
  PROPOSALS_SUBMISSION_QUERY,
} from './queries/proposalsData.query'
import { GOVERNANCE_CONFIG_QUERY } from './queries/governanceConfig.query'
import {
  DEFAULT_PROPOSALS_ACTIVE_SUBS,
  GOVERNANCE_CONFIG_SUB,
  PROPOSALS_DATA_SUB,
  DEFAULT_PROPOSALS_CTX,
  PROPOSALS_SUBMISSION_DATA,
  PROPOSALS_PAST_DATA,
  PROPOSALS_CURRENT_DATA,
} from './helpers/proposals.const'

export const proposalsContext = React.createContext<ProposalsContext>(undefined!)

type Props = {
  children: React.ReactNode
}

const ProposalsProvider = ({ children }: Props) => {
  const { handleQueryError } = useQueryProvider()
  const { userAddress } = useUserContext()

  const prevUserAddress = usePrevious(userAddress)

  const [proposalsCtxState, setProposalsCtxState] = useState<NullableProposalsContextState>(DEFAULT_PROPOSALS_CTX)
  const [activeSubs, setActiveSubs] = useState<ProposalsSubsRecordType>(DEFAULT_PROPOSALS_ACTIVE_SUBS)

  useEffect(() => {
    if (prevUserAddress !== userAddress) {
      setProposalsCtxState((prev) => ({
        ...prev,
        submissionProposalsIds: null,
      }))
    }
  }, [userAddress])

  /**
   * proposals subs:
   * GOVERNANCE_CONFIG_QUERY -> config data for governance, need to load before proposals, to be able to filter them correctly
   * CURRENT_PROPOSALS_QUERY -> proposals that are live at the moment
   * PAST_PROPOSALS_QUERY -> proposals that are dropped, executed, or failed voting
   * PROPOSALS_SUBMISSION_QUERY -> created proposals by user that are alive in current round
   */
  // Governance config changes only via completed governance votes (weeks-long cycles).
  // Load once with a 5-min cache — no need to poll it every 60s.
  useGraphQLQueryOnce(GOVERNANCE_CONFIG_QUERY, {
    skip: !activeSubs[GOVERNANCE_CONFIG_SUB] && !activeSubs[PROPOSALS_DATA_SUB],
    staleTime: CACHE_STATIC,
    onCompleted: (data) => {
      setProposalsCtxState((prev) => ({
        ...prev,
        config: normalizeGovernanceConfig(data),
      }))
    },
    onError: (error) => handleQueryError(error, 'GOVERNANCE_CONFIG_QUERY'),
  })

  useGraphQLQuery(CURRENT_PROPOSALS_QUERY, {
    skip: activeSubs[PROPOSALS_DATA_SUB] !== PROPOSALS_CURRENT_DATA,
    variables: {
      timelockProposalId: proposalsCtxState.config?.timelockProposalId ?? -1,
    },
    onCompleted: (data) => {
      const govConfigForProposalsNormalization = normalizeSmallGovernanceConfig(data.governance?.[0])

      const {
        currentRoundProposalsIds,
        waitingProposalsIdsToBeExecuted,
        waitingProposalsIdsToBePaid,
        submissionProposalsIds,
        proposalsMapper,
      } = normalizeProposals({
        indexerData: data,
        userAddress,
        governanceConfig: govConfigForProposalsNormalization,
      })

      setProposalsCtxState((prev) => ({
        ...prev,
        currentRoundProposalsIds,
        waitingProposalsIdsToBeExecuted,
        waitingProposalsIdsToBePaid,
        submissionProposalsIds,
        proposalsMapper: { ...(prev.proposalsMapper ?? {}), ...proposalsMapper },
      }))
    },
    onError: (error) => handleQueryError(error, 'CURRENT_PROPOSALS_QUERY'),
  })

  useGraphQLQuery(PAST_PROPOSALS_QUERY, {
    skip: activeSubs[PROPOSALS_DATA_SUB] !== PROPOSALS_PAST_DATA,
    onCompleted: (data) => {
      const govConfigForProposalsNormalization = normalizeSmallGovernanceConfig(data.governance?.[0])

      const { pastProposalsIds, proposalsMapper } = normalizeProposals({
        indexerData: data,
        userAddress,
        governanceConfig: govConfigForProposalsNormalization,
      })

      setProposalsCtxState((prev) => ({
        ...prev,
        pastProposalsIds,

        proposalsMapper: { ...(prev.proposalsMapper ?? {}), ...proposalsMapper },
      }))
    },
    onError: (error) => handleQueryError(error, 'PAST_PROPOSALS_QUERY'),
  })

  useGraphQLQuery(PROPOSALS_SUBMISSION_QUERY, {
    skip: activeSubs[PROPOSALS_DATA_SUB] !== PROPOSALS_SUBMISSION_DATA || !userAddress,
    variables: {
      userAddress: userAddress ?? '',
    },
    onCompleted: (data) => {
      const govConfigForProposalsNormalization = normalizeSmallGovernanceConfig(data.governance?.[0])

      const { submissionProposalsIds, proposalsMapper, currentRoundProposalsIds } = normalizeProposals({
        indexerData: data,
        userAddress,
        governanceConfig: govConfigForProposalsNormalization,
      })

      setProposalsCtxState((prev) => ({
        ...prev,
        submissionProposalsIds,
        currentRoundProposalsIds: Array.from(
          new Set([...(prev.currentRoundProposalsIds ?? []), ...currentRoundProposalsIds]),
        ),
        proposalsMapper: { ...(prev.proposalsMapper ?? {}), ...proposalsMapper },
      }))
    },
    onError: (error) => handleQueryError(error, 'PROPOSALS_SUBMISSION_QUERY'),
  })

  const changeProposalsSubscriptionsList = useCallback((newSkips: Partial<ProposalsSubsRecordType>) => {
    setActiveSubs((prev) => ({ ...prev, ...newSkips }))
  }, [])

  const contextProviderValue = useMemo(
    () =>
      getProposalsProviderReturnValue({
        proposalsCtxState,
        changeProposalsSubscriptionsList,
        activeSubs,
      }),
    [activeSubs, proposalsCtxState],
  )

  return <proposalsContext.Provider value={contextProviderValue}>{children}</proposalsContext.Provider>
}

export const useProposalsContext = () => {
  const context = useContext(proposalsContext)

  if (!context) {
    throw new Error('useProposalsContext should be used within ProposalsProvider')
  }

  return context
}

export default ProposalsProvider
