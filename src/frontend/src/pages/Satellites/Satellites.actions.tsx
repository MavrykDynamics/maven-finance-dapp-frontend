import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { getDoormanStorage } from 'pages/Doorman/Doorman.actions'
import { fetchFromIndexer } from '../../gql/fetchGraphQL'
import { nomalizeSatelliteConfig, normalizeSatellitesLedger } from './helpers/Satellites.normalizer'
import { updateUserData } from 'reducers/actions/user.actions'
import { toggleActionLoader } from 'app/App.components/Loader/Loader.action'

import { State } from 'reducers'
import type { AppDispatch, GetState } from '../../app/App.controller'

import { ERROR, INFO, SUCCESS } from 'app/App.components/Toaster/Toaster.constants'
import {
  SATELLITES_STORAGE_QUERY,
  SATELLITES_STORAGE_QUERY_NAME,
  SATELLITES_STORAGE_QUERY_VARIABLE,
  SATELLITE_CONFIG_QUERY,
  SATELLITE_CONFIG_QUERY_NAME,
  SATELLITE_CONFIG_QUERY_VARIABLE,
} from 'gql/queries'

export const GET_SATELLITES_STORAGE = 'GET_SATELLITES_STORAGE'
export const getSatellitesStorage = () => async (dispatch: AppDispatch, getState: GetState) => {
  try {
    const storage = await fetchFromIndexer(
      SATELLITES_STORAGE_QUERY,
      SATELLITES_STORAGE_QUERY_NAME,
      SATELLITES_STORAGE_QUERY_VARIABLE,
    )

    const { oraclesIds, activeSatellitesIds, allSatellitesIds, satellitesMapper } = normalizeSatellitesLedger(storage)

    dispatch({
      type: GET_SATELLITES_STORAGE,
      oraclesIds,
      activeSatellitesIds,
      allSatellitesIds,
      satellitesMapper,
    })
  } catch (error) {
    console.error('getSatellitesStorage error: ', error)
    if (error instanceof Error) {
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
  }
}

export const GET_SATELLITE_CONFIG = 'GET_SATELLITE_CONFIG'
export const getSatelliteConfig = () => async (dispatch: AppDispatch, getState: GetState) => {
  try {
    const storage = await fetchFromIndexer(
      SATELLITE_CONFIG_QUERY,
      SATELLITE_CONFIG_QUERY_NAME,
      SATELLITE_CONFIG_QUERY_VARIABLE,
    )

    const nomalizedConfig = nomalizeSatelliteConfig(storage)

    dispatch({ type: GET_SATELLITE_CONFIG, config: nomalizedConfig })
  } catch (error) {
    console.error('getSatelliteConfig error: ', error)
    if (error instanceof Error) {
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
  }
}

export const delegate = (satelliteAddress: string) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  if (!state.wallet.accountPkh) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  if (state.loading.isActionLoading) {
    dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
    return
  }

  if (state.wallet.user?.myMvkTokenBalance === 0 && state.wallet.user?.mySMvkTokenBalance === 0) {
    dispatch(showToaster(ERROR, 'Unable to Delegate', 'Please buy MVK and stake it'))
    return
  }

  if (state.wallet.user?.mySMvkTokenBalance === 0) {
    dispatch(showToaster(ERROR, 'Unable to Delegate', 'Please stake your MVK'))
    return
  }

  try {
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.delegationAddress.address)
    const transaction = await contract?.methods.delegateToSatellite(state.wallet.accountPkh, satelliteAddress).send()

    dispatch(toggleActionLoader(true))
    dispatch(showToaster(INFO, 'Delegating...', 'Please wait 30s'))

    await transaction?.confirmation()

    dispatch(showToaster(SUCCESS, 'Delegation done', 'All good :)'))

    await Promise.all([dispatch(getSatellitesStorage()), dispatch(getDoormanStorage())])

    await dispatch(updateUserData())
    await dispatch(toggleActionLoader(false))
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    dispatch(toggleActionLoader(false))
  }
}

export const undelegate = (delegateAddress: string) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  if (!state.wallet.accountPkh) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  if (state.loading.isActionLoading) {
    dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
    return
  }

  try {
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.delegationAddress.address)
    const transaction = await contract?.methods.undelegateFromSatellite(state.wallet.accountPkh, delegateAddress).send()

    dispatch(toggleActionLoader(true))
    dispatch(showToaster(INFO, 'Undelegating...', 'Please wait 30s'))

    await transaction?.confirmation()

    dispatch(showToaster(SUCCESS, 'Undelegating done', 'All good :)'))

    await Promise.all([dispatch(getSatellitesStorage()), dispatch(getDoormanStorage())])

    await dispatch(updateUserData())
    await dispatch(toggleActionLoader(false))
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    dispatch(toggleActionLoader(false))
  }
}
