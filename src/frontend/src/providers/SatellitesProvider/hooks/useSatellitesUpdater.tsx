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

// aggregator
// emergency_governance
// governance_financial_request
// governance_proposal
// satellite

export const useSatellitesUpdater = () => {
  const [storage, setStorage] = useState<Partial<SatellitesStorage>>({})
  const { updateSatellitesContext } = useSatellitesContext()

  useEffect(() => {
    if (
      storage.hasOwnProperty('aggregator') &&
      storage.hasOwnProperty('satellite') &&
      storage.hasOwnProperty('governance_proposal') &&
      storage.hasOwnProperty('emergency_governance') &&
      storage.hasOwnProperty('governance_financial_request')
    ) {
      console.log(storage, 'storage update')
      //   initializeDataFeeds(_data as GetOracleDataFeedsQuery, true)
      updateSatellitesContext(storage as SatellitesStorage)
    }
  }, [storage, updateSatellitesContext])

  const { loading: satellitesLoading } = useSubscription(SATELLITE_DATA_SUBSCRIPTION, {
    onData: ({ data: response }) => {
      const { data } = response
      if (data) {
        setStorage({ ...storage, satellite: [...data.satellite] })
      }
    },
  })

  const { loading: govProposalLoading } = useSubscription(SATELLITE_GOVERNANCE_PROPOSAL_DATA_SUBSCRIPTION, {
    onData: ({ data: response }) => {
      const { data } = response
      if (data) {
        setStorage({ ...storage, governance_proposal: [...data.governance_proposal] })
      }
    },
  })

  const { loading: emergencyGovLoading } = useSubscription(SATELLITE_EMERGENCY_GOVERNANCE_DATA_SUBSCRIPTION, {
    onData: ({ data: response }) => {
      const { data } = response
      if (data) {
        setStorage({ ...storage, emergency_governance: [...data.emergency_governance] })
      }
    },
  })

  const { loading: financialRequestLoading } = useSubscription(SATELLITE_GOVERNANCE_FINANCIAL_REQUEST_SUBSCRIPTION, {
    onData: ({ data: response }) => {
      const { data } = response
      if (data) {
        setStorage({ ...storage, governance_financial_request: [...data.governance_financial_request] })
      }
    },
  })

  const { loading: aggregatorOraclesLoading } = useSubscription(SATELLITE_AGGREGATOR_ORACLES_SUBSCRIPTION, {
    onData: ({ data: response }) => {
      const { data } = response
      if (data) {
        setStorage({ ...storage, aggregator: [...data.aggregator] })
      }
    },
  })

  return {
    isLoading:
      !satellitesLoading &&
      !govProposalLoading &&
      !emergencyGovLoading &&
      !financialRequestLoading &&
      !aggregatorOraclesLoading,
  }
}
