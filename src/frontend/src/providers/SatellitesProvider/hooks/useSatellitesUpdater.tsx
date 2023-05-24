import { useState, useEffect } from 'react'
import { useSubscription } from '@apollo/client'

// subs
import {
  getSatelliteDataSubscription,
  SATELLITE_GOVERNANCE_PROPOSAL_DATA_SUBSCRIPTION,
  SATELLITE_EMERGENCY_GOVERNANCE_DATA_SUBSCRIPTION,
  SATELLITE_GOVERNANCE_FINANCIAL_REQUEST_SUBSCRIPTION,
  SATELLITE_AGGREGATOR_ORACLES_SUBSCRIPTION,
} from 'gql/queries/getSatellitesStorage'
import { SatellitesStorage } from '../satellites.provider.types'
import { useSatellitesContext } from '../satellites.provider'

/**
 *
 * @param address string representation of satellite address (used for only one satellite subscription)
 * @param options {skip: boolean} options object to manipulate gq subscriptions
 * @returns {isLoading} boolean value which indicates if all data was loaded
 */
export const useSatellitesUpdater = (address = '', options = { skip: false }): { isLoading: boolean } => {
  const [storage, setStorage] = useState<Partial<SatellitesStorage>>({})
  const { updateSatellitesContext } = useSatellitesContext()

  const { loading: satellitesLoading } = useSubscription(getSatelliteDataSubscription(address), {
    onData: ({ data: response }) => {
      const { data } = response
      if (data) {
        console.log(data)
        setStorage({ ...storage, satellite: [...data.satellite] })
      }
    },
    onError: (error) => {
      console.log({ error })
    },
    skip: options.skip,
    shouldResubscribe: true,
  })

  const { loading: govProposalLoading } = useSubscription(SATELLITE_GOVERNANCE_PROPOSAL_DATA_SUBSCRIPTION, {
    onData: ({ data: response }) => {
      const { data } = response
      if (data) {
        setStorage({ ...storage, governance_proposal: [...data.governance_proposal] })
      }
    },
    skip: options.skip,
    shouldResubscribe: true,
  })

  const { loading: emergencyGovLoading } = useSubscription(SATELLITE_EMERGENCY_GOVERNANCE_DATA_SUBSCRIPTION, {
    onData: ({ data: response }) => {
      const { data } = response
      if (data) {
        setStorage({ ...storage, emergency_governance: [...data.emergency_governance] })
      }
    },
    skip: options.skip,
    shouldResubscribe: true,
  })

  const { loading: financialRequestLoading } = useSubscription(SATELLITE_GOVERNANCE_FINANCIAL_REQUEST_SUBSCRIPTION, {
    onData: ({ data: response }) => {
      const { data } = response
      if (data) {
        setStorage({ ...storage, governance_financial_request: [...data.governance_financial_request] })
      }
    },
    skip: options.skip,
    shouldResubscribe: true,
  })

  const { loading: aggregatorOraclesLoading } = useSubscription(SATELLITE_AGGREGATOR_ORACLES_SUBSCRIPTION, {
    onData: ({ data: response }) => {
      const { data } = response
      if (data) {
        setStorage({ ...storage, aggregator: [...data.aggregator] })
      }
    },
    skip: options.skip,
    shouldResubscribe: true,
  })

  const isStorageLoaded =
    !satellitesLoading &&
    !govProposalLoading &&
    !emergencyGovLoading &&
    !financialRequestLoading &&
    !aggregatorOraclesLoading

  useEffect(() => {
    console.log('run effect')
    if (
      storage.hasOwnProperty('aggregator') &&
      storage.hasOwnProperty('satellite') &&
      storage.hasOwnProperty('governance_proposal') &&
      storage.hasOwnProperty('emergency_governance') &&
      storage.hasOwnProperty('governance_financial_request')
    ) {
      updateSatellitesContext(storage as SatellitesStorage, address)
    }
  }, [storage, updateSatellitesContext, address])

  return {
    isLoading: isStorageLoaded,
  }
}
