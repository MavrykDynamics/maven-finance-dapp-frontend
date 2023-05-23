import { useState, useEffect } from 'react'
import { useSubscription } from '@apollo/client'

// subs
import {
  SATELLITE_DATA_SUBSCRIPTION,
  SATELLITE_GOVERNANCE_PROPOSAL_DATA_SUBSCRIPTION,
  SATELLITE_EMERGENCY_GOVERNANCE_DATA_SUBSCRIPTION,
  SATELLITE_GOVERNANCE_FINANCIAL_REQUEST_SUBSCRIPTION,
  SATELLITE_AGGREGATOR_ORACLES_SUBSCRIPTION,
} from 'gql/queries/getSatellitesStorage'
import { SatellitesStorage } from '../satellites.provider.types'
import { useSatellitesContext } from '../satellites.provider'

/**
 *
 * @param isInit boolean valut which forces to load data only once
 * @returns {isLoading} boolean value which indicates if all data was loaded
 */
export const useSatellitesUpdater = (isInit = false) => {
  const [shouldSkip, setShouldSkip] = useState(false)
  const [storage, setStorage] = useState<Partial<SatellitesStorage>>({})
  const { updateSatellitesContext } = useSatellitesContext()

  const { loading: satellitesLoading } = useSubscription(SATELLITE_DATA_SUBSCRIPTION, {
    onData: ({ data: response }) => {
      const { data } = response
      if (data) {
        setStorage({ ...storage, satellite: [...data.satellite] })
      }
    },
    skip: shouldSkip,
    shouldResubscribe: true,
  })

  const { loading: govProposalLoading } = useSubscription(SATELLITE_GOVERNANCE_PROPOSAL_DATA_SUBSCRIPTION, {
    onData: ({ data: response }) => {
      const { data } = response
      if (data) {
        setStorage({ ...storage, governance_proposal: [...data.governance_proposal] })
      }
    },
    skip: shouldSkip,
    shouldResubscribe: true,
  })

  const { loading: emergencyGovLoading } = useSubscription(SATELLITE_EMERGENCY_GOVERNANCE_DATA_SUBSCRIPTION, {
    onData: ({ data: response }) => {
      const { data } = response
      if (data) {
        setStorage({ ...storage, emergency_governance: [...data.emergency_governance] })
      }
    },
    skip: shouldSkip,
    shouldResubscribe: true,
  })

  const { loading: financialRequestLoading } = useSubscription(SATELLITE_GOVERNANCE_FINANCIAL_REQUEST_SUBSCRIPTION, {
    onData: ({ data: response }) => {
      const { data } = response
      if (data) {
        setStorage({ ...storage, governance_financial_request: [...data.governance_financial_request] })
      }
    },
    skip: shouldSkip,
    shouldResubscribe: true,
  })

  const { loading: aggregatorOraclesLoading } = useSubscription(SATELLITE_AGGREGATOR_ORACLES_SUBSCRIPTION, {
    onData: ({ data: response }) => {
      const { data } = response
      if (data) {
        setStorage({ ...storage, aggregator: [...data.aggregator] })
      }
    },
    skip: shouldSkip,
    shouldResubscribe: true,
  })

  const isStorageLoaded =
    !shouldSkip &&
    !satellitesLoading &&
    !govProposalLoading &&
    !emergencyGovLoading &&
    !financialRequestLoading &&
    !aggregatorOraclesLoading

  useEffect(() => {
    if (
      storage.hasOwnProperty('aggregator') &&
      storage.hasOwnProperty('satellite') &&
      storage.hasOwnProperty('governance_proposal') &&
      storage.hasOwnProperty('emergency_governance') &&
      storage.hasOwnProperty('governance_financial_request')
    ) {
      updateSatellitesContext(storage as SatellitesStorage)
    }
  }, [storage, updateSatellitesContext])

  useEffect(() => {
    if (isInit && isStorageLoaded) {
      setShouldSkip(true)
    }
  }, [isInit, shouldSkip, isStorageLoaded])

  return {
    isLoading: isStorageLoaded,
  }
}
