import { ApolloError } from '@apollo/client'
import React, { useContext, useMemo, useState } from 'react'

// helpers
import { normalizerSatelliteGovernance } from './helpers/satelliteGov.normalizer'
import { getSatelliteGovernanceProviderReturnValue } from './helpers/satelliteGov.utils'

// providers
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'

// types
import {
  NullableSatelliteGovernanceContextStateType,
  SatelliteGovSubsType,
  SatelliteGovernanceContext,
  SatelliteGovernanceSubsRecordType,
} from './satelliteGovernance.provider.types'
import { GetGovernanceSatelliteStorageQuery } from 'utils/__generated__/graphql'

// consts
import {
  DEFAULT_SATELLITE_GOVERNANCE_SUBS,
  DEFAULT_SATELLITE_GOV_CTX,
  SATELLITES_GOVERNANCE_STORAGE_SUB,
} from './helpers/satellitesGov.consts'
import { TOASTER_TEXTS } from 'app/App.components/Toaster/texts/toaster.texts'
import { TOASTER_SUBSCRIPTION_ERROR } from 'providers/ToasterProvider/toaster.provider.const'

// hooks
import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch'

// queries
import { SATELLITE_GOVERNANCE_STORAGE_QUERY } from './queries/satelliteGov.query'

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

  const handleSubError = (error: ApolloError, subName: SatelliteGovSubsType) => {
    console.error(`${subName} query error: `, error)
    bug(TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['message'], TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
  }

  // subscribes
  useQueryWithRefetch(SATELLITE_GOVERNANCE_STORAGE_QUERY, {
    skip: !activeSubs[SATELLITES_GOVERNANCE_STORAGE_SUB],
    onCompleted: (data) => {
      if (!data) return
      updateSatelliteGovernanceStorage(data)
    },
    onError: (error) => handleSubError(error, SATELLITES_GOVERNANCE_STORAGE_SUB),
  })

  // methods to update context data
  const updateSatelliteGovernanceStorage = (storage: GetGovernanceSatelliteStorageQuery) => {
    const { satelliteGovIdsMapper, mySatelliteGovIds, pastSatelliteGovIds, ongoingSatelliteGovIds } =
      normalizerSatelliteGovernance(storage, userAddress)

    setSatelliteGovCtxState((prev) => ({
      ...prev,
      satelliteGovIdsMapper,
      mySatelliteGovIds,
      pastSatelliteGovIds,
      ongoingSatelliteGovIds,
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
