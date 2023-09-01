import React, { useContext, useEffect, useMemo, useState } from 'react'
import { usePrevious } from 'react-use'
import { ApolloError } from '@apollo/client'

// hooks
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

// helpers
import { normalizeGovernanceConfig } from './helpers/governanceConfig.normalizer'
import { getProposalsProviderReturnValue } from './helpers/proposals.utils'
import { normalizeProposals, normalizeSubmissionProposals } from './helpers/proposals.normalizer'

// queries
import { getProposalsQuery, PROPOSALS_SUBMISSION_QUERY } from './queries/proposalsData.query'
import { GOVERNANCE_CONFIG_QUERY } from './queries/governanceConfig.query'

// types
import { ProposalsContext, NullableProposalsContextState, ProposalsSubsRecordType } from './proposals.provider.types'

// consts
import { TOASTER_TEXTS } from 'app/App.components/Toaster/texts/toaster.texts'
import { TOASTER_SUBSCRIPTION_ERROR } from 'providers/ToasterProvider/toaster.provider.const'
import {
  DEFAULT_PROPOSALS_ACTIVE_SUBS,
  GOVERNANCE_CONFIG_SUB,
  PROPOSALS_DATA_SUB,
  DEFAULT_PROPOSALS_CTX,
  PROPOSALS_SUBMISSION_DATA,
  GovPhases,
  PROPOSALS_PAST_DATA,
  PROPOSALS_CURRENT_DATA,
  PROPOSALS_ALL_DATA,
} from './helpers/proposals.const'

export const proposalsContext = React.createContext<ProposalsContext>(undefined!)

type Props = {
  children: React.ReactNode
}

const ProposalsProvider = ({ children }: Props) => {
  const { bug } = useToasterContext()
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

  const handleSubError = (error: ApolloError, subName: keyof ProposalsSubsRecordType) => {
    console.error(`${subName} query error: `, error)
    bug(TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['message'], TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
  }

  // subscribe to past proposals, active proposals or all proposals
  useQueryWithRefetch(
    getProposalsQuery({
      subType: activeSubs[PROPOSALS_DATA_SUB],
      isProposalRound: proposalsCtxState.config?.governancePhase === GovPhases.PROPOSAL,
    }),
    {
      skip:
        !activeSubs[PROPOSALS_DATA_SUB] ||
        activeSubs[PROPOSALS_DATA_SUB] === PROPOSALS_SUBMISSION_DATA ||
        !proposalsCtxState.config,
      variables: {
        timelockProposalId: proposalsCtxState.config?.timelockProposalId ?? -1,
      },
      onCompleted: (data) => {
        if (!data || !proposalsCtxState.config) return
        const {
          allProposalsIds,
          pastProposalsIds,
          currentRoundProposalsIds,
          waitingProposalsIdsToBeExecuted,
          waitingProposalsIdsToBePaid,
          proposalsMapper,
        } = normalizeProposals({
          indexerData: data,
          governanceConfig: proposalsCtxState.config,
        })

        const isPastProposalsQuery = activeSubs[PROPOSALS_DATA_SUB] === PROPOSALS_PAST_DATA
        const isCurrentProposalsQuery = activeSubs[PROPOSALS_DATA_SUB] === PROPOSALS_CURRENT_DATA
        const isAllProposalsQuery = activeSubs[PROPOSALS_DATA_SUB] === PROPOSALS_ALL_DATA

        setProposalsCtxState((prev) => ({
          ...prev,
          allProposalsIds: Array.from(new Set([...(prev.allProposalsIds ?? []), ...allProposalsIds])),
          pastProposalsIds: isPastProposalsQuery || isAllProposalsQuery ? pastProposalsIds : prev.pastProposalsIds,
          currentRoundProposalsIds:
            isCurrentProposalsQuery || isAllProposalsQuery ? currentRoundProposalsIds : prev.currentRoundProposalsIds,
          waitingProposalsIdsToBeExecuted:
            isCurrentProposalsQuery || isAllProposalsQuery
              ? waitingProposalsIdsToBeExecuted
              : prev.waitingProposalsIdsToBeExecuted,
          waitingProposalsIdsToBePaid:
            isCurrentProposalsQuery || isAllProposalsQuery
              ? waitingProposalsIdsToBePaid
              : prev.waitingProposalsIdsToBePaid,
          proposalsMapper: { ...(prev.proposalsMapper ?? {}), ...proposalsMapper },
        }))

        console.log('getProposalsQuery', {
          data,
          allProposalsIds,
          pastProposalsIds,
          currentRoundProposalsIds,
          waitingProposalsIdsToBeExecuted,
          waitingProposalsIdsToBePaid,
          proposalsMapper,
          activeSubs,
        })
      },
      onError: (error) => handleSubError(error, PROPOSALS_DATA_SUB),
    },
  )

  // subscribe to submission proposals, it will have only 2 proposal in max case
  useQueryWithRefetch(PROPOSALS_SUBMISSION_QUERY, {
    skip: activeSubs[PROPOSALS_DATA_SUB] !== PROPOSALS_SUBMISSION_DATA || !userAddress || !proposalsCtxState.config,
    variables: {
      userAddress: userAddress ?? '',
    },
    onCompleted: (data) => {
      if (!data || !proposalsCtxState.config) return

      const { submissionProposalsIds, proposalsMapper } = normalizeSubmissionProposals({
        indexerData: data,
        governanceConfig: proposalsCtxState.config,
      })

      setProposalsCtxState((prev) => ({
        ...prev,
        submissionProposalsIds,
        proposalsMapper: { ...prev.proposalsMapper, ...proposalsMapper },
      }))

      console.log('PROPOSALS_SUBMISSION_QUERY', { data, submissionProposalsIds, proposalsMapper, activeSubs })
    },
    onError: (error) => handleSubError(error, PROPOSALS_DATA_SUB),
  })

  // subscribe to governance config changes
  useQueryWithRefetch(GOVERNANCE_CONFIG_QUERY, {
    skip: !activeSubs[GOVERNANCE_CONFIG_SUB] || (!activeSubs[GOVERNANCE_CONFIG_SUB] && !activeSubs[PROPOSALS_DATA_SUB]),
    onCompleted: (data) => {
      setProposalsCtxState((prev) => ({
        ...prev,
        config: normalizeGovernanceConfig(data),
      }))
    },
    onError: (error) => handleSubError(error, GOVERNANCE_CONFIG_SUB),
  })

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
