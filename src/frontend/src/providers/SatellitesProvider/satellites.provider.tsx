import { ApolloError, useSubscription } from '@apollo/client'
import React, { useContext, useEffect, useMemo, useState } from 'react'

// helpers
import { getSatelliteDataSubscription } from './queries/satellites.query'
import { normalizeSatellitesLedger } from './helpers/satellites.normalizer'
import { SatelliteDataSubSubscription } from 'utils/__generated__/graphql'

// consts
import {
  DEFAULT_SATELLITES_ACTIVE_SUBS,
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
import { SatellitesContext, SatellitesCtxState, SatellitesSubsRecordType } from './satellites.provider.types'

// context
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

export const satellitesContext = React.createContext<SatellitesContext>(undefined!)

export type Props = {
  children: React.ReactNode
}

export const SatellitesProvider = ({ children }: Props) => {
  const { bug } = useToasterContext()

  const [satellitesCtxState, setSatellitesCtxState] = useState<SatellitesCtxState>({
    satelliteMapper: {},
    activeSatellitesIds: [],
    allSatellitesIds: [],
    oraclesIds: [],
    satelliteGovActionsAmount: 0,
    proposalsAmount: 0,
    finRequestsAmount: 0,
  })

  const [satelliteAddressToSubsctibe, setSatelliteAddressToSubsctibe] = useState<string | null>(null)
  const [activeSubs, setActiveSubs] = useState<SatellitesSubsRecordType>(DEFAULT_SATELLITES_ACTIVE_SUBS)
  const [isSatellitesLoading, setIsSatelliteLoading] = useState(false)

  /**
   * need to handle satellties loading status manually cun on queyry variable change it resets the loading status, in some cases it shows loading instead of already loaded data
   * we need to show loader for satellites metadata in 2 cases:
   *
   *    1. we are loading single satellite, whose data is not in context yet
   *    2. satellites context provider have data for less amount of satellites, that are exists
   *
   * NOTE: loader will be shown only when we set or unset specific satellite address
   **/
  useEffect(() => {
    const isLoadingNotLoadedSingleSatellite =
      satelliteAddressToSubsctibe && !satellitesCtxState.satelliteMapper[satelliteAddressToSubsctibe]
    const isLoadingAllSatellitesMetadata =
      Object.keys(satellitesCtxState.satelliteMapper).length !== satellitesCtxState.allSatellitesIds.length

    if (activeSubs[SATELLITE_DATA_SUB] && (isLoadingNotLoadedSingleSatellite || isLoadingAllSatellitesMetadata)) {
      setIsSatelliteLoading(true)
    }
  }, [satelliteAddressToSubsctibe])

  const handleSubError = (e: ApolloError, queryName: string) => {
    console.error(`${queryName} query error: `, { e })
    bug(TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['message'], TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
  }

  useSubscription(getSatelliteDataSubscription(satelliteAddressToSubsctibe), {
    skip: !activeSubs[SATELLITE_DATA_SUB],
    variables: {
      userAddress: satelliteAddressToSubsctibe ?? '',
    },
    onData: ({ data: { data } }) => {
      if (!data) return
      updateSatellitesContext(data)
    },
    onError: (e) => handleSubError(e, 'getSatelliteDataSubscription'),
    shouldResubscribe: true,
  })

  const { loading: satellitesAddressesLoading } = useSubscription(SATELLITES_ADDRESSES_SUBSCRIPTION, {
    skip: !activeSubs[SATELLITE_PARTICIPATION_DATA_SUB],
    onData: ({ data: { data } }) => {
      if (!data) return
      setSatellitesCtxState((prev) => ({
        ...prev,
        allSatellitesIds: Array.from(new Set(data.satellite_aggregate.nodes.map(({ user: { address } }) => address))),
      }))
    },
    onError: (e) => handleSubError(e, 'PROPOSALS_AMOUNT_SUBSCRIPTION'),
    shouldResubscribe: true,
  })

  const { loading: proposalsAmountLoading } = useSubscription(PROPOSALS_AMOUNT_SUBSCRIPTION, {
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

  const { loading: satelliteGovActionsAmountLoading } = useSubscription(SATELLITE_GOV_ACTIONS_AMOUNT_SUBSCRIPTION, {
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

  const { loading: finRequestsAmountLoading } = useSubscription(FINANCIAL_REQUESTS_AMOUNT_SUBSCRIPTION, {
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
  const updateSatellitesContext = (storage: SatelliteDataSubSubscription) => {
    const { oraclesIds, activeSatellitesIds, satelliteMapper } = normalizeSatellitesLedger(storage)

    if (isSatellitesLoading) setIsSatelliteLoading(false)

    setSatellitesCtxState((prev) => ({
      ...prev,
      satelliteMapper: satelliteAddressToSubsctibe ? { ...prev.satelliteMapper, ...satelliteMapper } : satelliteMapper,
      activeSatellitesIds: activeSatellitesIds,
      oraclesIds: oraclesIds,
    }))
  }

  const changeSatellitesSubscriptionsList = (newSkips: Partial<SatellitesSubsRecordType>) => {
    setActiveSubs((prev) => ({ ...prev, ...newSkips }))
  }

  const memoSatellitesContext = useMemo(() => {
    return {
      ...satellitesCtxState,
      isLoading:
        // satellitesLoading ||
        proposalsAmountLoading ||
        satelliteGovActionsAmountLoading ||
        finRequestsAmountLoading ||
        isSatellitesLoading ||
        satellitesAddressesLoading,
      setSatelliteAddressToSubsctibe,
      changeSatellitesSubscriptionsList,
    }
  }, [
    finRequestsAmountLoading,
    isSatellitesLoading,
    proposalsAmountLoading,
    satelliteGovActionsAmountLoading,
    satellitesAddressesLoading,
    satellitesCtxState,
  ])

  return <satellitesContext.Provider value={memoSatellitesContext}>{children}</satellitesContext.Provider>
}

export const useSatellitesContext = () => {
  const context = useContext(satellitesContext)

  if (!context) {
    throw new Error('satellitesContext should be used withing SatellitesProvider')
  }

  return context
}

export default SatellitesProvider
