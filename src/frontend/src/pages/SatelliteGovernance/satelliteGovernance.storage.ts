// types
import type { AppDispatch, GetState } from '../../app/App.controller'
import { State } from 'reducers'

// helpers
import { fetchFromIndexerWithPromise } from '../../gql/fetchGraphQL'
import { normalizerSatelliteGovernance } from './SatelliteGovernance.helpers'
import { TOASTER_ERROR } from 'app/App.components/Toaster/Toaster.constants'

// actions
import { showToaster } from 'app/App.components/Toaster/Toaster.actions'

// gql
import {
  SATELLITE_GOVERNANCE_STORAGE_QUERY,
  SATELLITE_GOVERNANCE_STORAGE_QUERY_NAME,
  SATELLITE_GOVERNANCE_STORAGE_QUERY_VARIABLE,
} from '../../gql/queries/getSatelliteGovernanceStorage'

// getSatelliteGovernanceStorage
export const GET_SATELLITE_GOVERNANCE_STORAGE = 'GET_SATELLITE_GOVERNANCE_STORAGE'
export const getSatelliteGovernanceStorage = () => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  const {
    wallet: { accountPkh },
  } = state

  try {
    const storage = await fetchFromIndexerWithPromise(
      SATELLITE_GOVERNANCE_STORAGE_QUERY,
      SATELLITE_GOVERNANCE_STORAGE_QUERY_NAME,
      SATELLITE_GOVERNANCE_STORAGE_QUERY_VARIABLE,
    )

    const satelliteGovernanceStorage = normalizerSatelliteGovernance({ storage, userAddress: accountPkh })

    await dispatch({
      type: GET_SATELLITE_GOVERNANCE_STORAGE,
      satelliteGovernanceStorage,
    })
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
    }
  }
}
