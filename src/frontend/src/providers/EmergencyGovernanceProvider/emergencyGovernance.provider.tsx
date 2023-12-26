import React, { useContext, useMemo, useState } from 'react'

// hooks
import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch'
import { useApolloContext } from 'providers/ApolloProvider/apollo.provider'

// types
import { EGovContext, EGovSubsRecordType, NullableEGovContextState } from './emergencyGovernance.provider.types'

// consts
import { EGOV_ALL_PROPOSALS } from './queries/eGovProposals.query'
import { MVN_DECIMALS, XTZ_DECIMALS } from 'utils/constants'
import {
  DEFAULT_EGOV_CTX,
  DEFAULT_EGOV_SUBS,
  EGOV_CONFIG_SUB,
  EGOV_PROPOSALS_ALL_SUB,
  EGOV_PROPOSALS_SUB,
} from './helpers/eGov.consts'
import { EGOV_CONFIG_QUERY } from './queries/eGovConfig.query'

// utils
import { convertNumberForClient } from 'utils/calcFunctions'
import { getEGovProviderReturnValue } from './helpers/eGov.utils'
import { normalizeEGovProposals } from './helpers/eGov.normalizer'

export const eGovContext = React.createContext<EGovContext>(undefined!)

type Props = {
  children: React.ReactNode
}

const EGovProvider = ({ children }: Props) => {
  const { handleApolloError } = useApolloContext()

  const [eGovCtxState, setEGovCtxState] = useState<NullableEGovContextState>(DEFAULT_EGOV_CTX)
  const [activeSubs, setActiveSubs] = useState<EGovSubsRecordType>(DEFAULT_EGOV_SUBS)

  /**
   * EGOV_CONFIG_QUERY -> eGov config
   * EGOV_ALL_PROPOSALS -> eGov proposals, query for all only, cuz they are used on eGov page only, and it shows them all at once
   */
  useQueryWithRefetch(EGOV_CONFIG_QUERY, {
    skip: !activeSubs[EGOV_CONFIG_SUB],
    onCompleted: (data) => {
      if (!data.emergency_governance[0]) return
      const eGovCOnfig = data.emergency_governance[0]
      setEGovCtxState((prev) => ({
        ...prev,
        config: {
          emergencyGovActive: eGovCOnfig.current_emergency_record_id !== 0,
          requiredFeeMutez: convertNumberForClient({
            number: eGovCOnfig.required_fee_mutez,
            grade: XTZ_DECIMALS,
          }),
          minStakedMvkRequiredToVote: convertNumberForClient({
            number: eGovCOnfig.min_smvk_required_to_vote,
            grade: MVN_DECIMALS,
          }),
          sMvkPercentageRequired: eGovCOnfig.smvk_percentage_required / 100,
        },
      }))
    },
    onError: (error) => handleApolloError(error, 'EGOV_CONFIG_QUERY'),
  })

  useQueryWithRefetch(EGOV_ALL_PROPOSALS, {
    skip: activeSubs[EGOV_PROPOSALS_SUB] !== EGOV_PROPOSALS_ALL_SUB,
    onCompleted: (data) => {
      const { pastProposals, proposalsMapper, ongoingProposals, allProposals } = normalizeEGovProposals(data)

      setEGovCtxState((prev) => ({
        ...prev,
        proposalsMapper: { ...prev.proposalsMapper, ...proposalsMapper },
        allProposals,
        ongoingProposals,
        pastProposals,
      }))
    },
    onError: (error) => handleApolloError(error, 'EGOV_ALL_PROPOSALS'),
  })

  //   set what data to subscribe
  const changeEGovSubscriptionsList = (newSkips: Partial<EGovSubsRecordType>) => {
    setActiveSubs((prev) => ({ ...prev, ...newSkips }))
  }

  const contextProviderValue = useMemo(
    () =>
      getEGovProviderReturnValue({
        eGovCtxState,
        changeEGovSubscriptionsList,
        activeSubs,
      }),
    [activeSubs, eGovCtxState],
  )

  return <eGovContext.Provider value={contextProviderValue}>{children}</eGovContext.Provider>
}

export const useEGovContext = () => {
  const context = useContext(eGovContext)

  if (!context) {
    throw new Error('useEGovContext should be used within EGovProvider')
  }

  return context
}

export default EGovProvider
