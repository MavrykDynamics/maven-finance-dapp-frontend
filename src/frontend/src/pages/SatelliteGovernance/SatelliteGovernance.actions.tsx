import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from 'app/App.components/Toaster/Toaster.constants'
import type { AppDispatch, GetState } from '../../app/App.controller'
import { State } from 'reducers'
import { fetchFromIndexerWithPromise } from '../../gql/fetchGraphQL'

// gql
import {
  GOVERNANCE_SATELLITE_STORAGE_QUERY,
  GOVERNANCE_SATELLITE_STORAGE_QUERY_NAME,
  GOVERNANCE_SATELLITE_STORAGE_QUERY_VARIABLE,
} from '../../gql/queries/getGovernanceSatelliteStorage'

import { SatelliteGovernanceTransfer } from '../../utils/TypesAndInterfaces/Satellites'
import { toggleActionLoader } from 'app/App.components/Loader/Loader.action'
import { DAPP_INSTANCE } from 'app/App.components/ConnectWallet/ConnectWallet.actions'

//getGovernanceSatelliteStorage
export const GET_GOVERNANCE_SATELLITE_STORAGE = 'GET_GOVERNANCE_SATELLITE_STORAGE'
export const getGovernanceSatelliteStorage = () => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  try {
    const governanceSatelliteStorage = await fetchFromIndexerWithPromise(
      GOVERNANCE_SATELLITE_STORAGE_QUERY,
      GOVERNANCE_SATELLITE_STORAGE_QUERY_NAME,
      GOVERNANCE_SATELLITE_STORAGE_QUERY_VARIABLE,
    )

    await dispatch({
      type: GET_GOVERNANCE_SATELLITE_STORAGE,
      governanceSatelliteStorage,
    })
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    dispatch({
      type: GET_GOVERNANCE_SATELLITE_STORAGE,
      error,
    })
  }
}

// Suspend Satellite
export const suspendSatellite =
  (satelliteAddress: string, purpose: string) => async (dispatch: AppDispatch, getState: GetState) => {
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
      await dispatch(toggleActionLoader(true))
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.governanceSatelliteAddress.address)
      const transaction = await contract?.methods.suspendSatellite(satelliteAddress, purpose).send()
      dispatch(showToaster(INFO, 'Suspend Satellite...', 'Please wait 30s'))

      await transaction?.confirmation()

      await dispatch(showToaster(SUCCESS, 'Suspend Satellite done', 'All good :)'))

      await dispatch(getGovernanceSatelliteStorage())
      await dispatch(toggleActionLoader(false))
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      await dispatch(toggleActionLoader(false))
    }
  }

// Unsuspend Satellite
export const unsuspendSatellite =
  (satelliteAddress: string, purpose: string) => async (dispatch: AppDispatch, getState: GetState) => {
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
      await dispatch(toggleActionLoader(true))
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.governanceSatelliteAddress.address)
      const transaction = await contract?.methods.restoreSatellite(satelliteAddress, purpose).send()

      await dispatch(showToaster(INFO, 'Unsuspend Satellite...', 'Please wait 30s'))
      await transaction?.confirmation()

      await dispatch(showToaster(SUCCESS, 'Unsuspend Satellite done', 'All good :)'))
      await dispatch(getGovernanceSatelliteStorage())

      await dispatch(toggleActionLoader(false))
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      await dispatch(toggleActionLoader(false))
    }
  }

// Ban Satellite
export const banSatellite =
  (satelliteAddress: string, purpose: string) => async (dispatch: AppDispatch, getState: GetState) => {
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
      await dispatch(toggleActionLoader(true))
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.governanceSatelliteAddress.address)
      const transaction = await contract?.methods.banSatellite(satelliteAddress, purpose).send()

      await dispatch(showToaster(INFO, 'Ban Satellite...', 'Please wait 30s'))

      await transaction?.confirmation()

      await dispatch(showToaster(SUCCESS, 'Ban Satellite done', 'All good :)'))

      await dispatch(getGovernanceSatelliteStorage())
      await dispatch(toggleActionLoader(false))
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      await dispatch(toggleActionLoader(false))
    }
  }

// Unban Satellite
export const unbanSatellite =
  (satelliteAddress: string, purpose: string) => async (dispatch: AppDispatch, getState: GetState) => {
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
      await dispatch(toggleActionLoader(true))
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.governanceSatelliteAddress.address)
      const transaction = await contract?.methods.unbanSatellite(satelliteAddress, purpose).send()

      await dispatch(showToaster(INFO, 'Unban Satellite...', 'Please wait 30s'))

      await transaction?.confirmation()

      await dispatch(showToaster(SUCCESS, 'Unban Satellite done', 'All good :)'))

      await dispatch(getGovernanceSatelliteStorage())
      await dispatch(toggleActionLoader(false))
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      await dispatch(toggleActionLoader(false))
    }
  }

// Remove all Oracles from Satellite
export const removeOracles =
  (satelliteAddress: string, purpose: string) => async (dispatch: AppDispatch, getState: GetState) => {
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
      await dispatch(toggleActionLoader(true))
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.governanceSatelliteAddress.address)
      const transaction = await contract?.methods.removeAllSatelliteOracles(satelliteAddress, purpose).send()

      await dispatch(showToaster(INFO, 'Remove all Oracles from Satellite...', 'Please wait 30s'))

      await transaction?.confirmation()

      await dispatch(showToaster(SUCCESS, 'Remove all Oracles from Satellite done', 'All good :)'))

      await dispatch(getGovernanceSatelliteStorage())
      await dispatch(toggleActionLoader(false))
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      await dispatch(toggleActionLoader(false))
    }
  }

// Remove from Aggregator
export const removeOracleInAggregator =
  (oracleAddress: string, satelliteAddress: string, purpose: string) =>
  async (dispatch: AppDispatch, getState: GetState) => {
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
      await dispatch(toggleActionLoader(true))
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.governanceSatelliteAddress.address)
      const transaction = await contract?.methods
        .removeOracleInAggregator(oracleAddress, satelliteAddress, purpose)
        .send()

      dispatch(showToaster(INFO, 'Remove from Aggregator...', 'Please wait 30s'))

      await transaction?.confirmation()

      dispatch(showToaster(SUCCESS, 'Remove from Aggregator done', 'All good :)'))

      await dispatch(getGovernanceSatelliteStorage())
      await dispatch(toggleActionLoader(false))
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      await dispatch(toggleActionLoader(false))
    }
  }

// Add Oracle to Aggregator
export const addOracleToAggregator =
  (oracleAddress: string, satelliteAddress: string, purpose: string) =>
  async (dispatch: AppDispatch, getState: GetState) => {
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
      await dispatch(toggleActionLoader(true))
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.governanceSatelliteAddress.address)
      const transaction = await contract?.methods.addOracleToAggregator(oracleAddress, satelliteAddress, purpose).send()

      await dispatch(showToaster(INFO, 'Add Oracle to Aggregator...', 'Please wait 30s'))

      await transaction?.confirmation()

      await dispatch(showToaster(SUCCESS, 'Add Oracle to Aggregator done', 'All good :)'))

      await dispatch(getGovernanceSatelliteStorage())
      await dispatch(toggleActionLoader(false))
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      await dispatch(toggleActionLoader(false))
    }
  }

// Set Aggregator Maintainer
export const setAggregatorMaintainer =
  (oracleAddress: string, satelliteAddress: string, purpose: string) =>
  async (dispatch: AppDispatch, getState: GetState) => {
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
      await dispatch(toggleActionLoader(true))
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.governanceSatelliteAddress.address)
      const transaction = await contract?.methods
        .setAggregatorMaintainer(oracleAddress, satelliteAddress, purpose)
        .send()

      await dispatch(showToaster(INFO, 'Set Aggregator Maintainer...', 'Please wait 30s'))

      await transaction?.confirmation()

      await dispatch(showToaster(SUCCESS, 'Set Aggregator Maintainer done', 'All good :)'))

      await dispatch(getGovernanceSatelliteStorage())
      await dispatch(toggleActionLoader(false))
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      await dispatch(toggleActionLoader(false))
    }
  }

// Drop Action
export const dropAction =
  (actionId: number, callback: () => void) => async (dispatch: AppDispatch, getState: GetState) => {
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
      await dispatch(toggleActionLoader(true))
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.governanceSatelliteAddress.address)
      const transaction = await contract?.methods.dropAction(actionId).send()

      dispatch(showToaster(INFO, 'Drop Action...', 'Please wait 30s'))

      await transaction?.confirmation()

      await dispatch(showToaster(SUCCESS, 'Drop Action done', 'All good :)'))

      await dispatch(getGovernanceSatelliteStorage())
      await dispatch(toggleActionLoader(false))
      callback()
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      await dispatch(toggleActionLoader(false))
    }
  }

// Vote YES
export const voteForAction =
  (actionId: number, voteType: string, callback: () => void) => async (dispatch: AppDispatch, getState: GetState) => {
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
      await dispatch(toggleActionLoader(true))
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.governanceSatelliteAddress.address)
      const transaction = await contract?.methods.voteForAction(actionId, voteType).send()

      await dispatch(showToaster(INFO, 'Vote YES...', 'Please wait 30s'))

      await transaction?.confirmation()

      await dispatch(showToaster(SUCCESS, 'Vote YES done', 'All good :)'))

      await dispatch(getGovernanceSatelliteStorage())
      await dispatch(toggleActionLoader(false))
      callback()
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      await dispatch(toggleActionLoader(false))
    }
  }

// Restore Satellite
export const restoreSatellite =
  (satelliteAddress: string, purpose: string) => async (dispatch: AppDispatch, getState: GetState) => {
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
      await dispatch(toggleActionLoader(true))
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.governanceSatelliteAddress.address)
      const transaction = await contract?.methods.restoreSatellite(satelliteAddress, purpose).send()

      await dispatch(showToaster(INFO, 'Restore Satellite...', 'Please wait 30s'))

      await transaction?.confirmation()

      await dispatch(showToaster(SUCCESS, 'Restore Satellite done', 'All good :)'))

      await dispatch(getGovernanceSatelliteStorage())
      await dispatch(toggleActionLoader(false))
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      await dispatch(toggleActionLoader(false))
    }
  }

// Update Aggregator Status
export const updateAggregatorStatus =
  (aggregatorAddress: string, status: string, purpose: string) => async (dispatch: AppDispatch, getState: GetState) => {
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
      await dispatch(toggleActionLoader(true))
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.governanceSatelliteAddress.address)
      const transaction = await contract?.methods.updateAggregatorStatus(aggregatorAddress, status, purpose).send()

      await dispatch(showToaster(INFO, 'Update Aggregator Status...', 'Please wait 30s'))

      await transaction?.confirmation()

      await dispatch(showToaster(SUCCESS, 'Update Aggregator Status done', 'All good :)'))

      await dispatch(getGovernanceSatelliteStorage())
      await dispatch(toggleActionLoader(false))
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      await dispatch(toggleActionLoader(false))
    }
  }

// Register Aggregator
export const registerAggregator =
  (aggregatorPair: string, aggregatorAddress: string) => async (dispatch: AppDispatch, getState: GetState) => {
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
      await dispatch(toggleActionLoader(true))
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.governanceSatelliteAddress.address)
      const transaction = await contract?.methods.registerAggregator(aggregatorPair, aggregatorAddress).send()

      await dispatch(showToaster(INFO, 'Register Aggregator...', 'Please wait 30s'))

      await transaction?.confirmation()

      await dispatch(showToaster(SUCCESS, 'Register Aggregator done', 'All good :)'))

      await dispatch(getGovernanceSatelliteStorage())
      await dispatch(toggleActionLoader(false))
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      await dispatch(toggleActionLoader(false))
    }
  }

// Fix Mistaken Transfer
export const fixMistakenTransfer =
  (targetContractAddress: string, purpose: string, transferList: SatelliteGovernanceTransfer[]) =>
  async (dispatch: AppDispatch, getState: GetState) => {
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
      await dispatch(toggleActionLoader(true))
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.governanceSatelliteAddress.address)
      const transaction = await contract?.methods
        .fixMistakenTransfer(targetContractAddress, purpose, transferList)
        .send()

      await dispatch(showToaster(INFO, 'Fix Mistaken Transfer...', 'Please wait 30s'))

      await transaction?.confirmation()

      await dispatch(showToaster(SUCCESS, 'Fix Mistaken Transfer done', 'All good :)'))
      await dispatch(getGovernanceSatelliteStorage())
      await dispatch(toggleActionLoader(false))
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      await dispatch(toggleActionLoader(false))
    }
  }
