import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import dayjs from 'dayjs'

// helpers
import {
  normalizeSatelliteGovernanceConfig,
  normalizerSatelliteGovernanceActions,
} from './helpers/satelliteGov.normalizer'
import { getSatelliteGovernanceProviderReturnValue } from './helpers/satelliteGov.utils'

// types
import {
  NullableSatelliteGovernanceContextStateType,
  SatelliteGovernanceContext,
  SatelliteGovernanceSubsRecordType,
} from './satelliteGovernance.provider.types'

// consts
import {
  DEFAULT_SATELLITE_GOVERNANCE_SUBS,
  DEFAULT_SATELLITE_GOV_CTX,
  SATELLITES_GOVERNANCE_CONFIG_SUB,
  SATELLITES_GOVERNANCE_CURRENT_USER_ACTIONS_SUB,
  SATELLITES_GOVERNANCE_ONGOING_ACTIONS_SUB,
  SATELLITES_GOVERNANCE_PAST_ACTIONS_SUB,
  SATELLITE_GOV_ACTIONS_DATA,
} from './helpers/satellitesGov.consts'
import {
  ONGOING_SATELLITES_GOVERNANCE_ACTIONS_QUERY,
  PAST_SATELLITES_GOVERNANCE_ACTIONS_QUERY,
  SATELLITE_GOVERNANCE_CONFIG_QUERY,
  USER_SATELLITES_GOVERNANCE_ACTIONS_QUERY,
} from './queries/satelliteGov.query'

// hooks
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useQueryProvider } from 'providers/QueryProvider/query.provider'
import { useGraphQLQuery, useGraphQLQueryOnce } from 'providers/QueryProvider/useGraphQLQuery'

// context
export const satelliteGovernanceContext = React.createContext<SatelliteGovernanceContext>(undefined!)

type Props = {
  children: React.ReactNode
}

const SatelliteGovernanceProvider = ({ children }: Props) => {
  const { handleQueryError } = useQueryProvider()
  const { userAddress } = useUserContext()

  const [satelliteGovCtxState, setSatelliteGovCtxState] =
    useState<NullableSatelliteGovernanceContextStateType>(DEFAULT_SATELLITE_GOV_CTX)
  const [activeSubs, setActiveSubs] = useState<SatelliteGovernanceSubsRecordType>(DEFAULT_SATELLITE_GOVERNANCE_SUBS)
  const currentTimeRef = useRef(dayjs().toISOString())

  const refetchQueryVariables = useCallback(
    () => ({
      currentTimestamp: dayjs().toISOString(),
    }),
    [currentTimeRef.current], // to have up-to-date query data after some indexer block update, DO NOT REMOVE from deps
  )

  useEffect(() => {
    if (activeSubs[SATELLITE_GOV_ACTIONS_DATA] !== null) {
      currentTimeRef.current = dayjs().toISOString()
    }
  }, [activeSubs])

  /**
   * SATELLITE_GOVERNANCE_CONFIG_QUERY -> load satellite governance config
   * ONGOING_SATELLITES_GOVERNANCE_ACTIONS_QUERY -> load all ongoing satellite governance actions
   * PAST_SATELLITES_GOVERNANCE_ACTIONS_QUERY -> load all past satellite governance actions
   * USER_SATELLITES_GOVERNANCE_ACTIONS_QUERY -> load all satellite governance actions created by user
   */
  useGraphQLQueryOnce(SATELLITE_GOVERNANCE_CONFIG_QUERY, {
    skip: !activeSubs[SATELLITES_GOVERNANCE_CONFIG_SUB],
    onCompleted: (data) => {
      setSatelliteGovCtxState((prev) => ({
        ...prev,
        config: normalizeSatelliteGovernanceConfig(data),
      }))
    },
    onError: (error) => handleQueryError(error, 'SATELLITE_GOVERNANCE_CONFIG_QUERY'),
  })

  useGraphQLQuery(
    ONGOING_SATELLITES_GOVERNANCE_ACTIONS_QUERY,
    {
      skip: activeSubs[SATELLITE_GOV_ACTIONS_DATA] !== SATELLITES_GOVERNANCE_ONGOING_ACTIONS_SUB,
      onCompleted: (data) => {
        const { satelliteGovIdsMapper, ongoingSatelliteGovIds } = normalizerSatelliteGovernanceActions(
          data,
          userAddress,
        )

        setSatelliteGovCtxState((prev) => ({
          ...prev,
          satelliteGovIdsMapper: { ...prev.satelliteGovIdsMapper, ...satelliteGovIdsMapper },
          ongoingSatelliteGovIds,
        }))
      },
      variables: {
        currentTimestamp: currentTimeRef.current,
      },
      onError: (error) => handleQueryError(error, 'ONGOING_SATELLITES_GOVERNANCE_ACTIONS_QUERY'),
    },
    {
      refetchQueryVariables,
    },
  )

  useGraphQLQuery(
    PAST_SATELLITES_GOVERNANCE_ACTIONS_QUERY,
    {
      skip: activeSubs[SATELLITE_GOV_ACTIONS_DATA] !== SATELLITES_GOVERNANCE_PAST_ACTIONS_SUB,
      onCompleted: (data) => {
        const { satelliteGovIdsMapper, pastSatelliteGovIds } = normalizerSatelliteGovernanceActions(data, userAddress)

        setSatelliteGovCtxState((prev) => ({
          ...prev,
          satelliteGovIdsMapper: { ...prev.satelliteGovIdsMapper, ...satelliteGovIdsMapper },
          pastSatelliteGovIds,
        }))
      },
      variables: {
        currentTimestamp: currentTimeRef.current,
      },
      onError: (error) => handleQueryError(error, 'PAST_SATELLITES_GOVERNANCE_ACTIONS_QUERY'),
    },
    {
      refetchQueryVariables,
    },
  )

  useGraphQLQuery(USER_SATELLITES_GOVERNANCE_ACTIONS_QUERY, {
    skip: activeSubs[SATELLITE_GOV_ACTIONS_DATA] !== SATELLITES_GOVERNANCE_CURRENT_USER_ACTIONS_SUB || !userAddress,
    onCompleted: (data) => {
      const { satelliteGovIdsMapper, mySatelliteGovIds } = normalizerSatelliteGovernanceActions(data, userAddress)

      setSatelliteGovCtxState((prev) => ({
        ...prev,
        satelliteGovIdsMapper: { ...prev.satelliteGovIdsMapper, ...satelliteGovIdsMapper },
        mySatelliteGovIds,
      }))
    },
    variables: {
      userAddress,
    },
    onError: (error) => handleQueryError(error, 'USER_SATELLITES_GOVERNANCE_ACTIONS_QUERY'),
  })

  const changeSatelliteGovSubscriptionsList = useCallback((subs: Partial<SatelliteGovernanceSubsRecordType>) => {
    setActiveSubs((prev) => ({ ...prev, ...subs }))
  }, [])

  const contextProviderValue = useMemo(
    () =>
      getSatelliteGovernanceProviderReturnValue({
        satelliteGovCtxState,
        changeSatelliteGovSubscriptionsList,
        activeSubs,
        userAddress,
      }),
    [activeSubs, satelliteGovCtxState, userAddress],
  )

  return (
    <satelliteGovernanceContext.Provider value={contextProviderValue}>{children}</satelliteGovernanceContext.Provider>
  )
}

export const useSatelliteGovernanceContext = () => {
  const context = useContext(satelliteGovernanceContext)

  if (!context) {
    throw new Error('useSatelliteGovernanceContext should be used within SatelliteGovernanceProvider')
  }

  return context
}

export default SatelliteGovernanceProvider
