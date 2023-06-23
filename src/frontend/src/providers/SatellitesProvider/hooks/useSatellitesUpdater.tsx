import { useState, useEffect } from 'react'
import { useSubscription } from '@apollo/client'

// subs
import {
  getSatelliteDataSubscription,
  SATELLITE_GOVERNANCE_PROPOSAL_DATA_SUBSCRIPTION,
  SATELLITE_EMERGENCY_GOVERNANCE_DATA_SUBSCRIPTION,
  SATELLITE_GOVERNANCE_FINANCIAL_REQUEST_SUBSCRIPTION,
  SATELLITE_AGGREGATOR_ORACLES_SUBSCRIPTION,
  SATELLITE_CYCLE_SUBSCRIPTION,
} from 'gql/queries/getSatellitesStorage'
import { SatellitesStorage, SatellitesSubsSkipsType } from '../satellites.provider.types'
import { useSatellitesContext } from '../satellites.provider'
import { SUB_QUERY, SUB_SKIP, SUB_SUBSCRIBE } from 'utils/api/apollo.consts'

export const useSatellitesUpdater = (
  {
    skipSatelliteData,
    skipGovProposal,
    skipEmergencyGov,
    skipFinancialRequest,
    skipAggregatorOracles,
    skipSatelliteCycle,
  }: SatellitesSubsSkipsType = {
    skipSatelliteData: SUB_SUBSCRIBE,
    skipGovProposal: SUB_SUBSCRIBE,
    skipEmergencyGov: SUB_SUBSCRIBE,
    skipFinancialRequest: SUB_SUBSCRIBE,
    skipAggregatorOracles: SUB_SUBSCRIBE,
    skipSatelliteCycle: SUB_SUBSCRIBE,
  },
  address = '',
): { isLoading: boolean } => {
  const [storage, setStorage] = useState<Partial<SatellitesStorage>>({})
  const [shouldSkip, setShouldSkip] = useState<SatellitesSubsSkipsType>({
    skipSatelliteData,
    skipGovProposal,
    skipEmergencyGov,
    skipFinancialRequest,
    skipAggregatorOracles,
    skipSatelliteCycle,
  })
  const { updateSatellitesContext } = useSatellitesContext()

  const { loading: satellitesLoading } = useSubscription(getSatelliteDataSubscription(address), {
    onData: ({ data: response }) => {
      const { data } = response
      if (data) setStorage({ ...storage, satellite: [...data.satellite] })
    },
    onError: (error) => {
      console.log({ error })
    },
    skip: shouldSkip.skipSatelliteData === SUB_SKIP,
    shouldResubscribe: true,
  })

  const { loading: govProposalLoading } = useSubscription(SATELLITE_GOVERNANCE_PROPOSAL_DATA_SUBSCRIPTION, {
    onData: ({ data: response }) => {
      const { data } = response
      if (data) {
        setStorage({ ...storage, governance_proposal: [...data.governance_proposal] })
      }
    },
    skip: shouldSkip.skipGovProposal === SUB_SKIP,
    shouldResubscribe: true,
  })

  const { loading: emergencyGovLoading } = useSubscription(SATELLITE_EMERGENCY_GOVERNANCE_DATA_SUBSCRIPTION, {
    onData: ({ data: response }) => {
      const { data } = response
      if (data) {
        setStorage({ ...storage, emergency_governance: [...data.emergency_governance] })
      }
    },
    skip: shouldSkip.skipEmergencyGov === SUB_SKIP,
    shouldResubscribe: true,
  })

  const { loading: financialRequestLoading } = useSubscription(SATELLITE_GOVERNANCE_FINANCIAL_REQUEST_SUBSCRIPTION, {
    onData: ({ data: response }) => {
      const { data } = response
      if (data) {
        setStorage({ ...storage, governance_financial_request: [...data.governance_financial_request] })
      }
    },
    skip: shouldSkip.skipFinancialRequest === SUB_SKIP,
    shouldResubscribe: true,
  })

  const { loading: aggregatorOraclesLoading } = useSubscription(SATELLITE_AGGREGATOR_ORACLES_SUBSCRIPTION, {
    onData: ({ data: response }) => {
      const { data } = response
      if (data) {
        setStorage({ ...storage, aggregator: [...data.aggregator] })
      }
    },
    skip: shouldSkip.skipAggregatorOracles === SUB_SKIP,
    shouldResubscribe: true,
  })

  const { loading: satelliteCycleLoading } = useSubscription(SATELLITE_CYCLE_SUBSCRIPTION, {
    onData: ({ data: response }) => {
      const { data } = response
      if (data) {
        setStorage({ ...storage, governance: [...data.governance] })
      }
    },
    skip: shouldSkip.skipSatelliteCycle === SUB_SKIP,
    shouldResubscribe: true,
  })

  const isStorageLoaded =
    !satellitesLoading &&
    !govProposalLoading &&
    !emergencyGovLoading &&
    !financialRequestLoading &&
    !satelliteCycleLoading &&
    !aggregatorOraclesLoading

  // Effect to load data 1 time and then skip loading, cuz loading returned from useSubscription so only for initial loading
  useEffect(() => {
    if (isStorageLoaded && skipSatelliteData === SUB_QUERY) {
      setShouldSkip((prevSkip) => ({
        ...prevSkip,
        skipSatelliteData: SUB_SKIP,
      }))
    }

    if (isStorageLoaded && skipGovProposal === SUB_QUERY) {
      setShouldSkip((prevSkip) => ({
        ...prevSkip,
        skipGovProposal: SUB_SKIP,
      }))
    }

    if (isStorageLoaded && skipEmergencyGov === SUB_QUERY) {
      setShouldSkip((prevSkip) => ({
        ...prevSkip,
        skipEmergencyGov: SUB_SKIP,
      }))
    }

    if (isStorageLoaded && skipFinancialRequest === SUB_QUERY) {
      setShouldSkip((prevSkip) => ({
        ...prevSkip,
        skipFinancialRequest: SUB_SKIP,
      }))
    }

    if (isStorageLoaded && skipAggregatorOracles === SUB_QUERY) {
      setShouldSkip((prevSkip) => ({
        ...prevSkip,
        skipAggregatorOracles: SUB_SKIP,
      }))
    }

    if (isStorageLoaded && skipSatelliteCycle === SUB_QUERY) {
      setShouldSkip((prevSkip) => ({
        ...prevSkip,
        skipSatelliteCycle: SUB_SKIP,
      }))
    }
  }, [
    isStorageLoaded,
    skipSatelliteData,
    skipGovProposal,
    skipEmergencyGov,
    skipFinancialRequest,
    skipAggregatorOracles,
    skipSatelliteCycle,
  ])

  useEffect(() => {
    if (
      // ensure if all necessary data is present
      isStorageLoaded &&
      storage.hasOwnProperty('aggregator') &&
      storage.hasOwnProperty('satellite') &&
      storage.hasOwnProperty('governance_proposal') &&
      storage.hasOwnProperty('emergency_governance') &&
      storage.hasOwnProperty('governance_financial_request') &&
      storage.hasOwnProperty('governance')
    ) {
      updateSatellitesContext(storage as SatellitesStorage, address)
    }
  }, [storage, updateSatellitesContext, address, isStorageLoaded])

  return {
    isLoading: !isStorageLoaded,
  }
}
