import { ApolloError } from '@apollo/client'
import React, { useContext, useMemo, useState } from 'react'

// helpers
import { getSatelliteDataQuery } from './queries/satellites.query'
import { normalizeSatellitesLedger } from './helpers/satellites.normalizer'
import { SatelliteDataQueryQuery } from 'utils/__generated__/graphql'
import { getSatellitesProviderReturnValue } from './helpers/satellites.utils'

// consts
import {
  DEFAULT_SATELLITES_ACTIVE_SUBS,
  DEFAULT_SATELLITES_CONTEXT,
  SATELLITES_DATA_ACTIVE_SUB,
  SATELLITES_DATA_ALL_SUB,
  SATELLITES_DATA_ORACLES_SUB,
  SATELLITES_DATA_SINGLE_SUB,
  SATELLITE_DATA_SUB,
  SATELLITE_PARTICIPATION_DATA_SUB,
} from './satellites.const'
import { SATELLITES_METRICS_DATA } from './queries/satellitesMetricsData.query'
import { TOASTER_TEXTS } from 'app/App.components/Toaster/texts/toaster.texts'
import { TOASTER_SUBSCRIPTION_ERROR } from 'providers/ToasterProvider/toaster.provider.const'

// types
import {
  SatellitesContext,
  SatellitesContextState,
  SatellitesDataDubsType,
  SatellitesSubsRecordType,
} from './satellites.provider.types'

// context
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch'

export const satellitesContext = React.createContext<SatellitesContext>(undefined!)

export type Props = {
  children: React.ReactNode
}

/**
 * NOTES:
 *
 * Single satellite sub: need to use SATELLITES_DATA_SINGLE_SUB sub type along with providing satellite addres
 * via setSatelliteAddressToSubsctibe, if this address is from indexer (userAddress, when isSatelliteTrue, or satelliteDelegatedTo)
 * you don't need to check whether satellite exists, if address can be modified by user, or we not sure whether satellite exists, we need to check it first
 * with apolloClient and CHECK_WHETHER_SATELLITE_EXISTS query, othervise if satellite is not exists it will show infinity loader
 */
export const SatellitesProvider = ({ children }: Props) => {
  const { bug } = useToasterContext()

  const [satellitesCtxState, setSatellitesCtxState] =
    useState<DeepNullable<SatellitesContextState>>(DEFAULT_SATELLITES_CONTEXT)

  const [satelliteAddressToSubsctibe, setSatelliteAddressToSubsctibe] = useState<string | null>(null)
  const [activeSubs, setActiveSubs] = useState<SatellitesSubsRecordType>(DEFAULT_SATELLITES_ACTIVE_SUBS)

  const handleSubError = (e: ApolloError, queryName: string) => {
    console.error(`${queryName} query error: `, { e })
    bug(TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['message'], TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
  }

  useQueryWithRefetch(
    getSatelliteDataQuery(
      satelliteAddressToSubsctibe,
      activeSubs[SATELLITE_DATA_SUB] === SATELLITES_DATA_ACTIVE_SUB,
      activeSubs[SATELLITE_DATA_SUB] === SATELLITES_DATA_ORACLES_SUB,
    ),
    {
      skip:
        // skip if page is not subscribed to the satellites
        !activeSubs[SATELLITE_DATA_SUB] ||
        // skip if page subscribed to the single satellite, but haven't provided address of satellite to subscribe
        (!satelliteAddressToSubsctibe && activeSubs[SATELLITE_DATA_SUB] === SATELLITES_DATA_SINGLE_SUB),
      variables: {
        userAddress: satelliteAddressToSubsctibe ?? '',
      },
      onCompleted: (data) => {
        if (!data) return
        updateSatellitesContext(data, satelliteAddressToSubsctibe, activeSubs[SATELLITE_DATA_SUB])
      },
      onError: (e) => handleSubError(e, 'getSatelliteDataQuery'),
    },
  )

  // Refetch proposals, finReqs, satelliteGov actions amount to calcs satellites metrics
  useQueryWithRefetch(SATELLITES_METRICS_DATA, {
    skip: !activeSubs[SATELLITE_PARTICIPATION_DATA_SUB],
    onCompleted: (data) => {
      setSatellitesCtxState((prev) => ({
        ...prev,
        proposalsAmount: data.governance_proposal_aggregate.aggregate?.count ?? 0,
        satelliteGovActionsAmount: data.governance_satellite_action_aggregate.aggregate?.count ?? 0,
        finRequestsAmount: data.governance_financial_request_aggregate.aggregate?.count ?? 0,
      }))
    },
    onError: (e) => handleSubError(e, 'SATELLITES_METRICS_DATA'),
  })

  // actions
  const updateSatellitesContext = (
    storage: SatelliteDataQueryQuery,
    satelliteAddressToSub: null | string,
    subType: SatellitesDataDubsType,
  ) => {
    if (!subType) return
    const { oraclesIds, activeSatellitesIds, satelliteMapper } = normalizeSatellitesLedger(storage)

    const allSatellitesIds = storage.satelliteAddresses.nodes.map(({ user: { address } }) => address)

    const isAllSatellitesSub = subType === SATELLITES_DATA_ALL_SUB && !satelliteAddressToSub
    const isLoadingSingleSatellite = subType === SATELLITES_DATA_SINGLE_SUB

    setSatellitesCtxState((prev) => ({
      ...prev,
      satelliteMapper: satelliteAddressToSubsctibe ? { ...prev.satelliteMapper, ...satelliteMapper } : satelliteMapper,
      allSatellitesIds,
      activeSatellitesIds:
        !isLoadingSingleSatellite && (isAllSatellitesSub || subType === SATELLITES_DATA_ACTIVE_SUB)
          ? activeSatellitesIds
          : prev.activeSatellitesIds,
      oraclesIds:
        !isLoadingSingleSatellite && (isAllSatellitesSub || subType === SATELLITES_DATA_ORACLES_SUB)
          ? oraclesIds
          : prev.oraclesIds,
    }))
  }

  const changeSatellitesSubscriptionsList = (newSkips: Partial<SatellitesSubsRecordType>) => {
    setActiveSubs((prev) => ({ ...prev, ...newSkips }))
  }

  const providerValue = useMemo(
    () =>
      getSatellitesProviderReturnValue({
        satellitesCtxState,
        satelliteAddressToSubsctibe,
        activeSubs,
        changeSatellitesSubscriptionsList,
        setSatelliteAddressToSubsctibe,
      }),
    [satellitesCtxState, activeSubs, satelliteAddressToSubsctibe],
  )

  return <satellitesContext.Provider value={providerValue}>{children}</satellitesContext.Provider>
}

export const useSatellitesContext = () => {
  const context = useContext(satellitesContext)

  if (!context) {
    throw new Error('satellitesContext should be used withing SatellitesProvider')
  }

  return context
}

export default SatellitesProvider
