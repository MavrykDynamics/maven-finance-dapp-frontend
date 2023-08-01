import React, { useContext, useMemo, useState } from 'react'
import { ApolloError, useSubscription } from '@apollo/client'

// context
import { ProposalsContext, ProposalsContextStateType, ProposalsSubsRecordType } from './proposals.provider.types'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

// consts
import { TOASTER_TEXTS } from 'app/App.components/Toaster/texts/toaster.texts'
import { TOASTER_SUBSCRIPTION_ERROR } from 'providers/ToasterProvider/toaster.provider.const'
import {
  DEFAULT_PROPOSALS_ACTIVE_SUBS,
  GOVERNANCE_CONFIG_SUB,
  PROPOSALS_DATA_SUB,
  DEFAULT_PROPOSALS_CTX,
  PROPOSALS_SUBMISSION_DATA,
} from './helpers/proposals.const'
import { GOVERNANCE_CONFIG_QUERY } from './queries/governanceConfig.query'
import { normalizeGovernanceConfig } from './helpers/governanceConfig.normalizer'
import { getProposalsProviderReturnValue } from './helpers/proposals.utils'
import { getProposalsQuery, getProposalsForSubmissionQuery } from './queries/proposalsData.query'
import { useUserContext } from 'providers/UserProvider/user.provider'

export const proposalsContext = React.createContext<ProposalsContext>(undefined!)

type Props = {
  children: React.ReactNode
}

const ProposalsProvider = ({ children }: Props) => {
  const { bug } = useToasterContext()
  const { userAddress } = useUserContext()

  const [proposalsCtxState, setProposalsCtxState] = useState<ProposalsContextStateType>(DEFAULT_PROPOSALS_CTX)
  const [activeSubs, setActiveSubs] = useState<ProposalsSubsRecordType>(DEFAULT_PROPOSALS_ACTIVE_SUBS)

  const handleSubError = (error: ApolloError, subName: keyof ProposalsSubsRecordType) => {
    console.error(`${subName} query error: `, error)
    bug(TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['message'], TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
  }

  // subscribes
  // proposals subscription
  useSubscription(getProposalsQuery(activeSubs[PROPOSALS_DATA_SUB]), {
    skip: !activeSubs[PROPOSALS_DATA_SUB] || activeSubs[PROPOSALS_DATA_SUB] === PROPOSALS_SUBMISSION_DATA,
    onData: ({ data: { data } }) => {
      if (!data) return
      console.log('getProposalsQuery', { data })
    },
    shouldResubscribe: true,
    onError: (error) => handleSubError(error, PROPOSALS_DATA_SUB),
  })

  // submission proposals subscriptions, it will have only 2 proposal in max case
  useSubscription(getProposalsForSubmissionQuery(), {
    skip: activeSubs[PROPOSALS_DATA_SUB] !== PROPOSALS_SUBMISSION_DATA && !userAddress,
    variables: {
      userAddress: userAddress ?? '',
    },
    onData: ({ data: { data } }) => {
      if (!data) return
      console.log('getProposalsForSubmissionQuery', { data })
    },
    shouldResubscribe: true,
    onError: (error) => handleSubError(error, PROPOSALS_DATA_SUB),
  })

  useSubscription(GOVERNANCE_CONFIG_QUERY, {
    skip: !activeSubs[GOVERNANCE_CONFIG_SUB],
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
