import React, { useContext, useEffect, useMemo, useState } from 'react'
import { usePrevious } from 'react-use'

// hooks
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useApolloContext } from 'providers/ApolloProvider/apollo.provider'
import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch'

// helpers
import { normalizeGovernanceConfig } from './helpers/governanceConfig.normalizer'
import { getProposalsProviderReturnValue } from './helpers/proposals.utils'
import { normalizeProposals } from './helpers/proposals.normalizer'

// types
import {
  ProposalsContext,
  NullableProposalsContextState,
  ProposalsSubsRecordType,
  ProposalIndexerType,
} from './proposals.provider.types'

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
  const { handleApolloError } = useApolloContext()
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
  useQueryWithRefetch(GOVERNANCE_CONFIG_QUERY, {
    skip: !activeSubs[GOVERNANCE_CONFIG_SUB] || (!activeSubs[GOVERNANCE_CONFIG_SUB] && !activeSubs[PROPOSALS_DATA_SUB]),
    onCompleted: (data) => {
      setProposalsCtxState((prev) => ({
        ...prev,
        config: normalizeGovernanceConfig(data),
      }))
    },
    onError: (error) => handleApolloError(error, 'GOVERNANCE_CONFIG_QUERY'),
  })

  useQueryWithRefetch(CURRENT_PROPOSALS_QUERY, {
    skip: activeSubs[PROPOSALS_DATA_SUB] !== PROPOSALS_CURRENT_DATA || !proposalsCtxState.config,
    variables: {
      timelockProposalId: proposalsCtxState.config?.timelockProposalId ?? -1,
    },
    onCompleted: (data) => updateProposals(data),
    onError: (error) => handleApolloError(error, 'CURRENT_PROPOSALS_QUERY'),
  })

  useQueryWithRefetch(PAST_PROPOSALS_QUERY, {
    skip: activeSubs[PROPOSALS_DATA_SUB] !== PROPOSALS_PAST_DATA || !proposalsCtxState.config,
    onCompleted: (data) => updateProposals(data),
    onError: (error) => handleApolloError(error, 'PAST_PROPOSALS_QUERY'),
  })

  useQueryWithRefetch(PROPOSALS_SUBMISSION_QUERY, {
    skip: activeSubs[PROPOSALS_DATA_SUB] !== PROPOSALS_SUBMISSION_DATA || !userAddress || !proposalsCtxState.config,
    variables: {
      userAddress: userAddress ?? '',
    },
    onCompleted: (data) => updateProposals(data),
    onError: (error) => handleApolloError(error, 'PROPOSALS_SUBMISSION_QUERY'),
  })

  const updateProposals = (indexerData: ProposalIndexerType) => {
    if (!proposalsCtxState.config) return

    const {
      allProposalsIds,
      pastProposalsIds,
      currentRoundProposalsIds,
      waitingProposalsIdsToBeExecuted,
      waitingProposalsIdsToBePaid,
      submissionProposalsIds,
      proposalsMapper,
    } = normalizeProposals({
      indexerData,
      userAddress,
      governanceConfig: proposalsCtxState.config,
    })

    const isPastProposalsQuery = activeSubs[PROPOSALS_DATA_SUB] === PROPOSALS_PAST_DATA
    const isCurrentProposalsQuery = activeSubs[PROPOSALS_DATA_SUB] === PROPOSALS_CURRENT_DATA
    const isSubmissionProposalsQuery = activeSubs[PROPOSALS_DATA_SUB] === PROPOSALS_SUBMISSION_DATA

    setProposalsCtxState((prev) => ({
      ...prev,
      allProposalsIds: Array.from(new Set([...(prev.allProposalsIds ?? []), ...allProposalsIds])),
      pastProposalsIds: isPastProposalsQuery ? pastProposalsIds : prev.pastProposalsIds,
      currentRoundProposalsIds: isCurrentProposalsQuery ? currentRoundProposalsIds : prev.currentRoundProposalsIds,
      waitingProposalsIdsToBeExecuted: isCurrentProposalsQuery
        ? waitingProposalsIdsToBeExecuted
        : prev.waitingProposalsIdsToBeExecuted,
      waitingProposalsIdsToBePaid: isCurrentProposalsQuery
        ? waitingProposalsIdsToBePaid
        : prev.waitingProposalsIdsToBePaid,
      submissionProposalsIds:
        isSubmissionProposalsQuery || isCurrentProposalsQuery ? submissionProposalsIds : prev.submissionProposalsIds,
      proposalsMapper: { ...(prev.proposalsMapper ?? {}), ...proposalsMapper },
    }))
  }

  const changeProposalsSubscriptionsList = (newSkips: Partial<ProposalsSubsRecordType>) => {
    setActiveSubs((prev) => ({ ...prev, ...newSkips }))
  }

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
