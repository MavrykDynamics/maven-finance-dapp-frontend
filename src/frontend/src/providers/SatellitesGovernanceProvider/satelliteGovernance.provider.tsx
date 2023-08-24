import { ApolloError } from '@apollo/client'
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
  SatelliteGovSubsType,
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
import { TOASTER_TEXTS } from 'app/App.components/Toaster/texts/toaster.texts'
import { TOASTER_SUBSCRIPTION_ERROR } from 'providers/ToasterProvider/toaster.provider.const'

// hooks
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch'

// queries
import { SATELLITE_GOVERNANCE_CONFIG_QUERY, getGovernanceActionsQuery } from './queries/satelliteGov.query'
import { GetGovernanceSatelliteActionsDataQuery, GetGovernanceSatelliteConfigQuery } from 'utils/__generated__/graphql'

// context
export const satelliteGovernanceContext = React.createContext<SatelliteGovernanceContext>(undefined!)

type Props = {
  children: React.ReactNode
}

const SatelliteGovernanceProvider = ({ children }: Props) => {
  const { bug } = useToasterContext()
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

  const handleSubError = (error: ApolloError, subName: SatelliteGovSubsType | null) => {
    console.error(`${subName ?? 'Nullable'} query error: `, error)
    bug(TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['message'], TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
  }

  // subscribes
  useQueryWithRefetch(
    SATELLITE_GOVERNANCE_CONFIG_QUERY,
    {
      skip: !activeSubs[SATELLITES_GOVERNANCE_CONFIG_SUB],
      onCompleted: (data) => {
        if (!data) return
        updateSatelliteGovConfig(data)
      },
      onError: (error) => handleSubError(error, SATELLITES_GOVERNANCE_CONFIG_SUB),
    },
    {
      blocksDiff: 4000,
    },
  )

  useQueryWithRefetch(
    getGovernanceActionsQuery(userAddress, activeSubs[SATELLITE_GOV_ACTIONS_DATA]),
    {
      skip: activeSubs[SATELLITE_GOV_ACTIONS_DATA] === null || userAddress === null,
      onCompleted: (data) => {
        if (!data) return
        updateSatelliteGovActionsData(data)
      },
      variables: {
        userAddress,
        currentTimestamp: currentTimeRef.current,
      },
      onError: (error) => handleSubError(error, activeSubs[SATELLITE_GOV_ACTIONS_DATA]),
    },
    {
      refetchQueryVariables,
    },
  )

  // methods to update context data
  const updateSatelliteGovConfig = (configData: GetGovernanceSatelliteConfigQuery) => {
    const config = normalizeSatelliteGovernanceConfig(configData)

    setSatelliteGovCtxState((prev) => ({
      ...prev,
      config,
    }))
  }

  const updateSatelliteGovActionsData = (actionsData: GetGovernanceSatelliteActionsDataQuery) => {
    const { satelliteGovIdsMapper, mySatelliteGovIds, pastSatelliteGovIds, ongoingSatelliteGovIds } =
      normalizerSatelliteGovernanceActions(actionsData, userAddress)

    const isUserSatelliteGovActionsSub =
      activeSubs[SATELLITE_GOV_ACTIONS_DATA] === SATELLITES_GOVERNANCE_CURRENT_USER_ACTIONS_SUB
    const isPastSatelliteGovActionsSub =
      activeSubs[SATELLITE_GOV_ACTIONS_DATA] === SATELLITES_GOVERNANCE_PAST_ACTIONS_SUB
    const isOngoingSatelliteGovActionsSub =
      activeSubs[SATELLITE_GOV_ACTIONS_DATA] === SATELLITES_GOVERNANCE_ONGOING_ACTIONS_SUB

    setSatelliteGovCtxState((prev) => ({
      ...prev,
      satelliteGovIdsMapper: { ...prev.satelliteGovIdsMapper, ...satelliteGovIdsMapper },
      // to avoid empty screen or loader between tab switches - just show old data
      mySatelliteGovIds: isUserSatelliteGovActionsSub ? mySatelliteGovIds : prev.mySatelliteGovIds,
      pastSatelliteGovIds: isPastSatelliteGovActionsSub ? pastSatelliteGovIds : prev.pastSatelliteGovIds,
      ongoingSatelliteGovIds: isOngoingSatelliteGovActionsSub ? ongoingSatelliteGovIds : prev.ongoingSatelliteGovIds,
    }))
  }

  const changeSatelliteGovSubscriptionsList = (subs: Partial<SatelliteGovernanceSubsRecordType>) => {
    setActiveSubs((prev) => ({ ...prev, ...subs }))
  }

  const contextProviderValue = useMemo(
    () =>
      getSatelliteGovernanceProviderReturnValue({
        satelliteGovCtxState,
        changeSatelliteGovSubscriptionsList,
        activeSubs,
      }),
    [activeSubs, satelliteGovCtxState],
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
