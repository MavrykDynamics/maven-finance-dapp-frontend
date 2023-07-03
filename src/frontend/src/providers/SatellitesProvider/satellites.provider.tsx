import { ApolloError, useSubscription } from '@apollo/client'
import React, { useContext, useEffect, useMemo, useState } from 'react'

// helpers
import { getSatelliteDataSubscription } from './queries/satellites.query'
import { normalizeSatellitesLedger } from 'providers/SatellitesProvider/helpers/satellites.normalizer'
import { SatelliteDataSubSubscription } from 'utils/__generated__/graphql'

// consts
import { ALL_SATELLITES_SUB } from './satellites.const'
import {
  FINANCIAL_REQUESTS_AMOUNT_SUBSCRIPTION,
  PROPOSALS_AMOUNT_SUBSCRIPTION,
  SATELLITES_ADDRESSES_SUBSCRIPTION,
  SATELLITE_GOV_ACTIONS_AMOUNT_SUBSCRIPTION,
} from './queries/satellitesMetricsData.query'
import { TOASTER_TEXTS } from 'app/App.components/Toaster/texts/toaster.texts'
import { TOASTER_SUBSCRIPTION_ERROR } from 'providers/ToasterProvider/toaster.provider.const'

// types
import { SatellitesContext, SatellitesCtxState } from './satellites.provider.types'

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

  const [satelliteAddressToSubsctibe, setSatelliteAddressToSubsctibe] = useState<string | typeof ALL_SATELLITES_SUB>(
    ALL_SATELLITES_SUB,
  )
  const [isSatellitesLoading, setIsSatelliteLoading] = useState(false)

  /**
   * need this effect to track whether user subscribes to cetrain satellite of resubs to all satellites, to show loading status if it's loading
   * cuz useSubscription is not changing it's returned loading on variable change
   **/
  useEffect(() => {
    setIsSatelliteLoading(true)
  }, [satelliteAddressToSubsctibe])

  const handleSubError = (e: ApolloError, queryName: string) => {
    console.error(`${queryName} query error: `, { e })
    bug(TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['message'], TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
  }

  const { loading: satellitesLoading } = useSubscription(getSatelliteDataSubscription(satelliteAddressToSubsctibe), {
    variables: {
      userAddress: satelliteAddressToSubsctibe,
    },
    onData: ({ data: { data } }) => {
      if (!data) return
      updateSatellitesContext(data)
    },
    onError: (e) => handleSubError(e, 'getSatelliteDataSubscription'),
    shouldResubscribe: true,
  })

  const { loading: satellitesAddressesLoading } = useSubscription(SATELLITES_ADDRESSES_SUBSCRIPTION, {
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

    if (satelliteAddressToSubsctibe) {
      setIsSatelliteLoading(false)
    }

    setSatellitesCtxState((prev) => ({
      ...prev,
      satelliteMapper: satelliteAddressToSubsctibe ? { ...prev.satelliteMapper, ...satelliteMapper } : satelliteMapper,
      activeSatellitesIds: activeSatellitesIds,
      oraclesIds: oraclesIds,
    }))
  }

  const memoSatellitesContext = useMemo(() => {
    // TODO: debug log
    console.log({ satellites: satellitesCtxState })
    return {
      ...satellitesCtxState,
      isLoading:
        satellitesLoading ||
        proposalsAmountLoading ||
        satelliteGovActionsAmountLoading ||
        finRequestsAmountLoading ||
        isSatellitesLoading ||
        satellitesAddressesLoading,
      setSatelliteAddressToSubsctibe,
    }
  }, [
    finRequestsAmountLoading,
    isSatellitesLoading,
    proposalsAmountLoading,
    satelliteGovActionsAmountLoading,
    satellitesAddressesLoading,
    satellitesCtxState,
    satellitesLoading,
  ])

  return <satellitesContext.Provider value={memoSatellitesContext}>{children}</satellitesContext.Provider>
}

export const useSatellitesContext = () => {
  const context = useContext(satellitesContext)

  if (!context) {
    throw new Error('satellitesContext should be used withing Satellites provider')
  }

  return context
}

export default SatellitesProvider
