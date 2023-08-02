import React, { useContext, useEffect, useMemo, useState } from 'react'
import { usePrevious } from 'react-use'
import { ApolloError, useSubscription } from '@apollo/client'

// context
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

// helpers
import { normalizeGovernanceConfig } from './helpers/governanceConfig.normalizer'
import { getProposalsProviderReturnValue } from './helpers/proposals.utils'

// queries
import { getProposalsQuery, PROPOSALS_SUBMISSION_SUB } from './queries/proposalsData.query'
import { GOVERNANCE_CONFIG_QUERY } from './queries/governanceConfig.query'

// types
import { ProposalsContext, ProposalsContextStateType, ProposalsSubsRecordType } from './proposals.provider.types'

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
import { normalizeProposals, normalizeSubmissionProposals } from './helpers/proposals.normalizer'

export const proposalsContext = React.createContext<ProposalsContext>(undefined!)

type Props = {
  children: React.ReactNode
}

const ProposalsProvider = ({ children }: Props) => {
  const { bug } = useToasterContext()
  const { userAddress } = useUserContext()

  const prevUserAddress = usePrevious(userAddress)

  const [proposalsCtxState, setProposalsCtxState] = useState<ProposalsContextStateType>(DEFAULT_PROPOSALS_CTX)
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
  useSubscription(
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
      onData: ({ data: { data } }) => {
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

        // if we subscribe to past proposals update only past proposals stuff
        if (isPastProposalsQuery) {
          setProposalsCtxState((prev) => ({
            ...prev,
            pastProposalsIds,
            proposalsMapper: { ...(prev.proposalsMapper ?? {}), ...proposalsMapper },
          }))
        }
        // if we subscribe to current proposals (inc. newly created) update current proposals fields and merge with all proposals, cuz user can create new proposal and it will be loaded within this sub
        else if (isCurrentProposalsQuery) {
          setProposalsCtxState((prev) => ({
            ...prev,
            currentRoundProposalsIds,
            waitingProposalsIdsToBeExecuted,
            waitingProposalsIdsToBePaid,
            allProposalsIds: Array.from(new Set([...(prev.allProposalsIds ?? []), ...allProposalsIds])),
            proposalsMapper: { ...(prev.proposalsMapper ?? {}), ...proposalsMapper },
          }))
        }
        // if we subscribe to all proposals update all fiedls
        else if (isAllProposalsQuery) {
          setProposalsCtxState((prev) => ({
            ...prev,
            allProposalsIds,
            currentRoundProposalsIds,
            pastProposalsIds,
            waitingProposalsIdsToBeExecuted,
            waitingProposalsIdsToBePaid,
            proposalsMapper,
          }))
        }

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
      shouldResubscribe: true,
      onError: (error) => handleSubError(error, PROPOSALS_DATA_SUB),
    },
  )

  // subscribe to submission proposals, it will have only 2 proposal in max case
  useSubscription(PROPOSALS_SUBMISSION_SUB, {
    skip: activeSubs[PROPOSALS_DATA_SUB] !== PROPOSALS_SUBMISSION_DATA || !userAddress || !proposalsCtxState.config,
    variables: {
      userAddress: userAddress ?? '',
    },
    onData: ({ data: { data } }) => {
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

      console.log('PROPOSALS_SUBMISSION_SUB', { data, submissionProposalsIds, proposalsMapper, activeSubs })
    },
    shouldResubscribe: true,
    onError: (error) => handleSubError(error, PROPOSALS_DATA_SUB),
  })

  // subscribe to governance config changes
  useSubscription(GOVERNANCE_CONFIG_QUERY, {
    skip: !activeSubs[GOVERNANCE_CONFIG_SUB] || (!activeSubs[GOVERNANCE_CONFIG_SUB] && !activeSubs[PROPOSALS_DATA_SUB]),
    onData: ({ data: { data } }) => {
      if (!data) return
      setProposalsCtxState((prev) => ({
        ...prev,
        config: normalizeGovernanceConfig(data),
      }))
    },
    shouldResubscribe: true,
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
