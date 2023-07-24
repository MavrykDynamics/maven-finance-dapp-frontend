import { ApolloError, useSubscription } from '@apollo/client'
import React, { useContext, useMemo, useState } from 'react'

// helpers
import { getSatelliteDataSubscription } from './queries/satellites.query'
import { normalizeSatellitesLedger } from './helpers/satellites.normalizer'
import { SatelliteDataSubSubscription } from 'utils/__generated__/graphql'
import { getSatellitesProviderReturnValue } from './helpers/satellites.utils'

// consts
import {
  DEFAULT_SATELLITES_ACTIVE_SUBS,
  DEFAULT_SATELLITES_CONTEXT,
  SATELLITES_DATA_ACTIVE_SUB,
  SATELLITES_DATA_ALL_SUB,
  SATELLITES_DATA_ORACLES_SUB,
  SATELLITES_DATA_SINGLE_SUB,
  SATELLITE_ALL_ADDRESSES_SUB,
  SATELLITE_DATA_SUB,
  SATELLITE_PARTICIPATION_DATA_SUB,
} from './satellites.const'
import {
  FINANCIAL_REQUESTS_AMOUNT_SUBSCRIPTION,
  PROPOSALS_AMOUNT_SUBSCRIPTION,
  SATELLITES_ADDRESSES_SUBSCRIPTION,
  SATELLITE_GOV_ACTIONS_AMOUNT_SUBSCRIPTION,
} from './queries/satellitesMetricsData.query'
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

  const [satellitesCtxState, setSatellitesCtxState] = useState<SatellitesContextState>(DEFAULT_SATELLITES_CONTEXT)

  const [satelliteAddressToSubsctibe, setSatelliteAddressToSubsctibe] = useState<string | null>(null)
  const [activeSubs, setActiveSubs] = useState<SatellitesSubsRecordType>(DEFAULT_SATELLITES_ACTIVE_SUBS)

  const handleSubError = (e: ApolloError, queryName: string) => {
    console.error(`${queryName} query error: `, { e })
    bug(TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['message'], TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
  }

  useSubscription(
    getSatelliteDataSubscription(
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
      onData: ({ data: { data } }) => {
        if (!data) return
        updateSatellitesContext(data, satelliteAddressToSubsctibe, activeSubs[SATELLITE_DATA_SUB])
      },
      onError: (e) => handleSubError(e, 'getSatelliteDataSubscription'),
      shouldResubscribe: true,
    },
  )

  useSubscription(SATELLITES_ADDRESSES_SUBSCRIPTION, {
    skip: !activeSubs[SATELLITE_ALL_ADDRESSES_SUB],
    onData: ({ data: { data } }) => {
      if (!data) return
      setSatellitesCtxState((prev) => ({
        ...prev,
        allSatellitesIds: data.satellite_aggregate.nodes.map(({ user: { address } }) => address),
      }))
    },
    onError: (e) => handleSubError(e, 'PROPOSALS_AMOUNT_SUBSCRIPTION'),
    shouldResubscribe: true,
  })

  useSubscription(PROPOSALS_AMOUNT_SUBSCRIPTION, {
    skip: !activeSubs[SATELLITE_PARTICIPATION_DATA_SUB],
    onData: ({ data: { data } }) => {
      if (!data) return
      setSatellitesCtxState((prev) => ({
        ...prev,
        proposalsAmount: data.governance_proposal_aggregate.aggregate?.count ?? 0,
      }))
    },
    onError: (e) => handleSubError(e, 'PROPOSALS_AMOUNT_SUBSCRIPTION'),
    shouldResubscribe: true,
  })

  useSubscription(SATELLITE_GOV_ACTIONS_AMOUNT_SUBSCRIPTION, {
    skip: !activeSubs[SATELLITE_PARTICIPATION_DATA_SUB],
    onData: ({ data: { data } }) => {
      if (!data) return
      setSatellitesCtxState((prev) => ({
        ...prev,
        satelliteGovActionsAmount: data.governance_satellite_action_aggregate.aggregate?.count ?? 0,
      }))
    },
    onError: (e) => handleSubError(e, 'SATELLITE_GOV_ACTIONS_AMOUNT_SUBSCRIPTION'),
    shouldResubscribe: true,
  })

  useSubscription(FINANCIAL_REQUESTS_AMOUNT_SUBSCRIPTION, {
    skip: !activeSubs[SATELLITE_PARTICIPATION_DATA_SUB],
    onData: ({ data: { data } }) => {
      if (!data) return
      setSatellitesCtxState((prev) => ({
        ...prev,
        finRequestsAmount: data.governance_financial_request_aggregate.aggregate?.count ?? 0,
      }))
    },
    onError: (e) => handleSubError(e, 'FINANCIAL_REQUESTS_AMOUNT_SUBSCRIPTION'),
    shouldResubscribe: true,
  })

  // actions
  const updateSatellitesContext = (
    storage: SatelliteDataSubSubscription,
    satelliteAddressToSub: null | string,
    subType: SatellitesDataDubsType,
  ) => {
    if (!subType) return
    const { oraclesIds, activeSatellitesIds, satelliteMapper, allSatellitesIds } = normalizeSatellitesLedger(storage)

    const isAllSatellitesSub = subType === SATELLITES_DATA_ALL_SUB && !satelliteAddressToSub
    const isLoadingSingleSatellite = subType === SATELLITES_DATA_SINGLE_SUB

    setSatellitesCtxState((prev) => ({
      ...prev,
      satelliteMapper: satelliteAddressToSubsctibe ? { ...prev.satelliteMapper, ...satelliteMapper } : satelliteMapper,
      allSatellitesIds: !isLoadingSingleSatellite && isAllSatellitesSub ? allSatellitesIds : prev.allSatellitesIds,
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
