// types
import type { AppDispatch, GetState } from '../../app/App.controller'
import { State } from 'reducers'
import { SatelliteGovernanceTransfer } from 'providers/SatellitesProvider/satellites.provider.types'

// helpers
import { fetchFromIndexerWithPromise } from '../../gql/fetchGraphQL'
import { normalizerSatelliteGovernance } from './SatelliteGovernance.helpers'
import {
  ACTION_COMPLETION_MESSAGE_TEXT,
  ACTION_START_MESSAGE_TEXT,
  TOASTER_ERROR,
  TOASTER_INFO,
  TOASTER_LOADING,
  TOASTER_SUCCESS,
  TOASTER_UPDATE_DATA_AFTER_ACTION_DATA,
} from 'app/App.components/Toaster/Toaster.constants'
import { checkIndexerLevelAndRunDataUpdateCallback } from '../../utils/checkIndexerLevel/checkIndexerLevel'

// actions
import { hideToaster, showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { DAPP_INSTANCE } from 'providers/UserProvider/user.provider'
import { toggleActionCompletion, toggleActionFullScreenLoader } from 'app/App.components/Loader/Loader.action'

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

// Suspend Satellite
export const suspendSatellite =
  (satelliteAddress: string, purpose: string) => async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    // check whether we can send transaction
    if (!state.wallet.accountPkh) {
      dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    try {
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.governanceSatelliteAddress.address)
      const transaction = await contract?.methods.suspendSatellite(satelliteAddress, purpose).send()

      dispatch(toggleActionFullScreenLoader(true))
      dispatch(toggleActionCompletion(true))
      dispatch(showToaster(TOASTER_INFO, 'Triggering Suspend Satellite...', ACTION_START_MESSAGE_TEXT))

      // turn off fs actions loader and start data updating after 5s after operation started
      setTimeout(async () => {
        await dispatch(toggleActionFullScreenLoader(false))
        await dispatch(
          showToaster(
            TOASTER_LOADING,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.title,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.message,
          ),
        )

        // @ts-ignore don't have proper type to access data, type has only methods
        const currentOperationLevel = transaction?.lastHead?.header?.level

        // re-fetch data we need
        await checkIndexerLevelAndRunDataUpdateCallback({
          callback: async () => {
            // Add here call for update data actions
            await dispatch(getSatelliteGovernanceStorage())
            await dispatch(hideToaster())
            await dispatch(
              showToaster(TOASTER_SUCCESS, 'Suspend Satellite vote triggered', ACTION_COMPLETION_MESSAGE_TEXT),
            )
            await dispatch(toggleActionCompletion(false))
          },
          currentOperationLevel,
        })
      }, 5000)
    } catch (error) {
      console.error('Suspend Satellite error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
      }
      await dispatch(toggleActionFullScreenLoader(false))
    }
  }

// Unsuspend Satellite
export const unsuspendSatellite =
  (satelliteAddress: string, purpose: string) => async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    if (!state.wallet.accountPkh) {
      dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    try {
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.governanceSatelliteAddress.address)
      const transaction = await contract?.methods.restoreSatellite(satelliteAddress, purpose).send()

      dispatch(toggleActionFullScreenLoader(true))
      dispatch(toggleActionCompletion(true))
      dispatch(showToaster(TOASTER_INFO, 'Triggering Unsuspend Satellite...', ACTION_START_MESSAGE_TEXT))

      // turn off fs actions loader and start data updating after 5s after operation started
      setTimeout(async () => {
        await dispatch(toggleActionFullScreenLoader(false))
        await dispatch(
          showToaster(
            TOASTER_LOADING,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.title,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.message,
          ),
        )

        // @ts-ignore don't have proper type to access data, type has only methods
        const currentOperationLevel = transaction?.lastHead?.header?.level

        // re-fetch data we need
        await checkIndexerLevelAndRunDataUpdateCallback({
          callback: async () => {
            // Add here call for update data actions
            await dispatch(getSatelliteGovernanceStorage())
            await dispatch(hideToaster())
            await dispatch(
              showToaster(TOASTER_SUCCESS, 'Unsuspend Satellite vote triggered', ACTION_COMPLETION_MESSAGE_TEXT),
            )
            await dispatch(toggleActionCompletion(false))
          },
          currentOperationLevel,
        })
      }, 5000)
    } catch (error) {
      console.error('Unsuspend Satellite error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
      }
      dispatch(toggleActionFullScreenLoader(false))
      dispatch(toggleActionCompletion(false))
    }
  }

// Ban Satellite
export const banSatellite =
  (satelliteAddress: string, purpose: string) => async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    if (!state.wallet.accountPkh) {
      dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    try {
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.governanceSatelliteAddress.address)
      const transaction = await contract?.methods.banSatellite(satelliteAddress, purpose).send()

      dispatch(toggleActionFullScreenLoader(true))
      dispatch(toggleActionCompletion(true))
      dispatch(showToaster(TOASTER_INFO, 'Triggering Ban Satellite...', ACTION_START_MESSAGE_TEXT))

      // turn off fs actions loader and start data updating after 5s after operation started
      setTimeout(async () => {
        await dispatch(toggleActionFullScreenLoader(false))
        await dispatch(
          showToaster(
            TOASTER_LOADING,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.title,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.message,
          ),
        )

        // @ts-ignore don't have proper type to access data, type has only methods
        const currentOperationLevel = transaction?.lastHead?.header?.level

        // re-fetch data we need
        await checkIndexerLevelAndRunDataUpdateCallback({
          callback: async () => {
            // Add here call for update data actions
            await dispatch(getSatelliteGovernanceStorage())

            await dispatch(hideToaster())
            await dispatch(showToaster(TOASTER_SUCCESS, 'Ban Satellite vote triggered', ACTION_COMPLETION_MESSAGE_TEXT))
            await dispatch(toggleActionCompletion(false))
          },
          currentOperationLevel,
        })
      }, 5000)
    } catch (error) {
      console.error('Ban Satellite error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
      }
      dispatch(toggleActionFullScreenLoader(false))
      dispatch(toggleActionCompletion(false))
    }
  }

// Unban Satellite
export const unbanSatellite =
  (satelliteAddress: string, purpose: string) => async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    if (!state.wallet.accountPkh) {
      dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    try {
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.governanceSatelliteAddress.address)
      const transaction = await contract?.methods.restoreSatellite(satelliteAddress, purpose).send()

      dispatch(toggleActionFullScreenLoader(true))
      dispatch(toggleActionCompletion(true))
      dispatch(showToaster(TOASTER_INFO, 'Triggering Unban Satellite...', ACTION_START_MESSAGE_TEXT))

      // turn off fs actions loader and start data updating after 5s after operation started
      setTimeout(async () => {
        await dispatch(toggleActionFullScreenLoader(false))
        await dispatch(
          showToaster(
            TOASTER_LOADING,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.title,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.message,
          ),
        )

        // @ts-ignore don't have proper type to access data, type has only methods
        const currentOperationLevel = transaction?.lastHead?.header?.level

        // re-fetch data we need
        await checkIndexerLevelAndRunDataUpdateCallback({
          callback: async () => {
            // Add here call for update data actions
            await dispatch(getSatelliteGovernanceStorage())

            await dispatch(hideToaster())
            await dispatch(
              showToaster(TOASTER_SUCCESS, 'Unban Satellite vote triggered', ACTION_COMPLETION_MESSAGE_TEXT),
            )
            await dispatch(toggleActionCompletion(false))
          },
          currentOperationLevel,
        })
      }, 5000)
    } catch (error) {
      console.error('Unban Satellite error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
      }
      dispatch(toggleActionFullScreenLoader(false))
      dispatch(toggleActionCompletion(false))
    }
  }

// Remove all Oracles from Satellite
export const removeOracles =
  (satelliteAddress: string, purpose: string) => async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    if (!state.wallet.accountPkh) {
      dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    try {
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.governanceSatelliteAddress.address)
      const transaction = await contract?.methods.removeAllSatelliteOracles(satelliteAddress, purpose).send()

      dispatch(toggleActionFullScreenLoader(true))
      dispatch(toggleActionCompletion(true))
      dispatch(showToaster(TOASTER_INFO, 'Remove all Oracles from Satellite...', ACTION_START_MESSAGE_TEXT))

      // turn off fs actions loader and start data updating after 5s after operation started
      setTimeout(async () => {
        await dispatch(toggleActionFullScreenLoader(false))
        await dispatch(
          showToaster(
            TOASTER_LOADING,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.title,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.message,
          ),
        )

        // @ts-ignore don't have proper type to access data, type has only methods
        const currentOperationLevel = transaction?.lastHead?.header?.level

        // re-fetch data we need
        await checkIndexerLevelAndRunDataUpdateCallback({
          callback: async () => {
            // Add here call for update data actions
            await dispatch(getSatelliteGovernanceStorage())

            await dispatch(hideToaster())
            await dispatch(
              showToaster(TOASTER_SUCCESS, 'Remove all Oracles from Satellite done', ACTION_COMPLETION_MESSAGE_TEXT),
            )
            await dispatch(toggleActionCompletion(false))
          },
          currentOperationLevel,
        })
      }, 5000)
    } catch (error) {
      console.error('Remove all Oracles from Satellite error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
      }
      dispatch(toggleActionFullScreenLoader(false))
      dispatch(toggleActionCompletion(false))
    }
  }

// Remove from Aggregator
export const removeOracleInAggregator =
  (oracleAddress: string, satelliteAddress: string, purpose: string) =>
  async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    if (!state.wallet.accountPkh) {
      dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    try {
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.governanceSatelliteAddress.address)
      const transaction = await contract?.methods
        .removeOracleInAggregator(oracleAddress, satelliteAddress, purpose)
        .send()

      dispatch(toggleActionFullScreenLoader(true))
      dispatch(toggleActionCompletion(true))
      dispatch(showToaster(TOASTER_INFO, 'Remove from aggregator', ACTION_START_MESSAGE_TEXT))

      // turn off fs actions loader and start data updating after 5s after operation started
      setTimeout(async () => {
        await dispatch(toggleActionFullScreenLoader(false))
        await dispatch(
          showToaster(
            TOASTER_LOADING,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.title,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.message,
          ),
        )

        // @ts-ignore don't have proper type to access data, type has only methods
        const currentOperationLevel = transaction?.lastHead?.header?.level

        // re-fetch data we need
        await checkIndexerLevelAndRunDataUpdateCallback({
          callback: async () => {
            // Add here call for update data actions
            await dispatch(getSatelliteGovernanceStorage())

            await dispatch(hideToaster())
            await dispatch(showToaster(TOASTER_SUCCESS, 'Remove from aggregator done', ACTION_COMPLETION_MESSAGE_TEXT))
            await dispatch(toggleActionCompletion(false))
          },
          currentOperationLevel,
        })
      }, 5000)
    } catch (error) {
      console.error('Remove Oracle from aggregator error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
      }
      dispatch(toggleActionFullScreenLoader(false))
      dispatch(toggleActionCompletion(false))
    }
  }

// Add Oracle to Aggregator
export const addOracleToAggregator =
  (oracleAddress: string, satelliteAddress: string, purpose: string) =>
  async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    if (!state.wallet.accountPkh) {
      dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    try {
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.governanceSatelliteAddress.address)
      const transaction = await contract?.methods.addOracleToAggregator(oracleAddress, satelliteAddress, purpose).send()

      dispatch(toggleActionFullScreenLoader(true))
      dispatch(toggleActionCompletion(true))
      dispatch(showToaster(TOASTER_INFO, 'Adding Oracle to aggregator...', ACTION_START_MESSAGE_TEXT))

      // turn off fs actions loader and start data updating after 5s after operation started
      setTimeout(async () => {
        await dispatch(toggleActionFullScreenLoader(false))
        await dispatch(
          showToaster(
            TOASTER_LOADING,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.title,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.message,
          ),
        )

        // @ts-ignore don't have proper type to access data, type has only methods
        const currentOperationLevel = transaction?.lastHead?.header?.level

        // re-fetch data we need
        await checkIndexerLevelAndRunDataUpdateCallback({
          callback: async () => {
            // Add here call for update data actions
            await dispatch(getSatelliteGovernanceStorage())

            await dispatch(hideToaster())
            await dispatch(
              showToaster(TOASTER_SUCCESS, 'Adding Oracle to Aggregator done', ACTION_COMPLETION_MESSAGE_TEXT),
            )
            await dispatch(toggleActionCompletion(false))
          },
          currentOperationLevel,
        })
      }, 5000)
    } catch (error) {
      console.error('Add Oracle from aggregator error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
      }
      dispatch(toggleActionFullScreenLoader(false))
      dispatch(toggleActionCompletion(false))
    }
  }

// Set Aggregator Maintainer
export const setAggregatorMaintainer =
  (oracleAddress: string, satelliteAddress: string, purpose: string) =>
  async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    if (!state.wallet.accountPkh) {
      dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    try {
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.governanceSatelliteAddress.address)
      const transaction = await contract?.methods
        .setAggregatorMaintainer(oracleAddress, satelliteAddress, purpose)
        .send()

      dispatch(toggleActionFullScreenLoader(true))
      dispatch(toggleActionCompletion(true))
      dispatch(showToaster(TOASTER_INFO, 'Set Aggregator Maintainer...', ACTION_START_MESSAGE_TEXT))

      // turn off fs actions loader and start data updating after 5s after operation started
      setTimeout(async () => {
        await dispatch(toggleActionFullScreenLoader(false))
        await dispatch(
          showToaster(
            TOASTER_LOADING,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.title,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.message,
          ),
        )

        // @ts-ignore don't have proper type to access data, type has only methods
        const currentOperationLevel = transaction?.lastHead?.header?.level

        // re-fetch data we need
        await checkIndexerLevelAndRunDataUpdateCallback({
          callback: async () => {
            // Add here call for update data actions
            await dispatch(getSatelliteGovernanceStorage())
            await dispatch(hideToaster())
            await dispatch(
              showToaster(TOASTER_SUCCESS, 'Set Aggregator Maintainer done', ACTION_COMPLETION_MESSAGE_TEXT),
            )
            await dispatch(toggleActionCompletion(false))
          },
          currentOperationLevel,
        })
      }, 5000)
    } catch (error) {
      console.error('Set Aggregator Maintainer error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
      }
      dispatch(toggleActionFullScreenLoader(false))
      dispatch(toggleActionCompletion(false))
    }
  }

// Drop Action
export const dropAction =
  (actionId: number, callback?: () => void) => async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    if (!state.wallet.accountPkh) {
      dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    try {
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.governanceSatelliteAddress.address)
      const transaction = await contract?.methods.dropAction(actionId).send()

      callback?.()
      dispatch(toggleActionFullScreenLoader(true))
      dispatch(toggleActionCompletion(true))
      dispatch(showToaster(TOASTER_INFO, 'Dropping Action...', ACTION_START_MESSAGE_TEXT))

      // turn off fs actions loader and start data updating after 5s after operation started
      setTimeout(async () => {
        await dispatch(toggleActionFullScreenLoader(false))
        await dispatch(
          showToaster(
            TOASTER_LOADING,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.title,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.message,
          ),
        )

        // @ts-ignore don't have proper type to access data, type has only methods
        const currentOperationLevel = transaction?.lastHead?.header?.level

        // re-fetch data we need
        await checkIndexerLevelAndRunDataUpdateCallback({
          callback: async () => {
            // Add here call for update data actions
            await dispatch(getSatelliteGovernanceStorage())

            await dispatch(hideToaster())
            await dispatch(showToaster(TOASTER_SUCCESS, 'Drop Action done', ACTION_COMPLETION_MESSAGE_TEXT))
            await dispatch(toggleActionCompletion(false))
          },
          currentOperationLevel,
        })
      }, 5000)
    } catch (error) {
      console.error('Drop Action error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
        callback?.()
      }
      dispatch(toggleActionFullScreenLoader(false))
      dispatch(toggleActionCompletion(false))
    }
  }

// Vote YES
export const voteForAction =
  (actionId: number, voteType: string, callback?: () => void) => async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    if (!state.wallet.accountPkh) {
      dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    try {
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.governanceSatelliteAddress.address)
      const transaction = await contract?.methods.voteForAction(actionId, voteType).send()

      callback?.()
      dispatch(toggleActionFullScreenLoader(true))
      dispatch(toggleActionCompletion(true))
      dispatch(showToaster(TOASTER_INFO, `Voting ${voteType}...`, ACTION_START_MESSAGE_TEXT))

      // turn off fs actions loader and start data updating after 5s after operation started
      setTimeout(async () => {
        await dispatch(toggleActionFullScreenLoader(false))
        await dispatch(
          showToaster(
            TOASTER_LOADING,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.title,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.message,
          ),
        )

        // @ts-ignore don't have proper type to access data, type has only methods
        const currentOperationLevel = transaction?.lastHead?.header?.level

        // re-fetch data we need
        await checkIndexerLevelAndRunDataUpdateCallback({
          callback: async () => {
            // Add here call for update data actions
            await dispatch(getSatelliteGovernanceStorage())
            // await dispatch(getSatellitesStorage())
            await dispatch(hideToaster())
            await dispatch(showToaster(TOASTER_SUCCESS, `${voteType} vote registered`, ACTION_COMPLETION_MESSAGE_TEXT))
            await dispatch(toggleActionCompletion(false))
          },
          currentOperationLevel,
        })
      }, 5000)
    } catch (error) {
      console.error(`${voteType} Vote For Action error:`, error)
      if (error instanceof Error) {
        dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
        callback?.()
      }
      dispatch(toggleActionFullScreenLoader(false))
      dispatch(toggleActionCompletion(false))
    }
  }

// Restore Satellite
export const restoreSatellite =
  (satelliteAddress: string, purpose: string) => async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    if (!state.wallet.accountPkh) {
      dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    try {
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.governanceSatelliteAddress.address)
      const transaction = await contract?.methods.restoreSatellite(satelliteAddress, purpose).send()

      dispatch(toggleActionFullScreenLoader(true))
      dispatch(toggleActionCompletion(true))
      dispatch(showToaster(TOASTER_INFO, `Restoring Satellite...`, ACTION_START_MESSAGE_TEXT))

      // turn off fs actions loader and start data updating after 5s after operation started
      setTimeout(async () => {
        await dispatch(toggleActionFullScreenLoader(false))
        await dispatch(
          showToaster(
            TOASTER_LOADING,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.title,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.message,
          ),
        )

        // @ts-ignore don't have proper type to access data, type has only methods
        const currentOperationLevel = transaction?.lastHead?.header?.level

        // re-fetch data we need
        await checkIndexerLevelAndRunDataUpdateCallback({
          callback: async () => {
            // Add here call for update data actions
            await dispatch(getSatelliteGovernanceStorage())

            await dispatch(hideToaster())
            await dispatch(
              showToaster(TOASTER_SUCCESS, `Restore Satellite vote started`, ACTION_COMPLETION_MESSAGE_TEXT),
            )
            await dispatch(toggleActionCompletion(false))
          },
          currentOperationLevel,
        })
      }, 5000)
    } catch (error) {
      console.error('Restore Satellite error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
      }
      dispatch(toggleActionFullScreenLoader(false))
      dispatch(toggleActionCompletion(false))
    }
  }

// Update Aggregator Status
export const updateAggregatorStatus =
  (aggregatorAddress: string, status: string, purpose: string) => async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    if (!state.wallet.accountPkh) {
      dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    try {
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.governanceSatelliteAddress.address)
      const transaction = await contract?.methods.updateAggregatorStatus(aggregatorAddress, status, purpose).send()

      dispatch(toggleActionFullScreenLoader(true))
      dispatch(toggleActionCompletion(true))
      dispatch(showToaster(TOASTER_INFO, `Update Aggregator Status...`, ACTION_START_MESSAGE_TEXT))

      // turn off fs actions loader and start data updating after 5s after operation started
      setTimeout(async () => {
        await dispatch(toggleActionFullScreenLoader(false))
        await dispatch(
          showToaster(
            TOASTER_LOADING,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.title,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.message,
          ),
        )

        // @ts-ignore don't have proper type to access data, type has only methods
        const currentOperationLevel = transaction?.lastHead?.header?.level

        // re-fetch data we need
        await checkIndexerLevelAndRunDataUpdateCallback({
          callback: async () => {
            // Add here call for update data actions
            await dispatch(getSatelliteGovernanceStorage())
            await dispatch(hideToaster())
            await dispatch(showToaster(TOASTER_SUCCESS, `Aggregator Status Updated`, ACTION_COMPLETION_MESSAGE_TEXT))
            await dispatch(toggleActionCompletion(false))
          },
          currentOperationLevel,
        })
      }, 5000)
    } catch (error) {
      console.error('Update Aggregator Status error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
      }
      dispatch(toggleActionFullScreenLoader(false))
      dispatch(toggleActionCompletion(false))
    }
  }

// Register Aggregator
export const registerAggregator =
  (aggregatorPair: string, aggregatorAddress: string) => async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    if (!state.wallet.accountPkh) {
      dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    try {
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.governanceSatelliteAddress.address)
      const transaction = await contract?.methods.registerAggregator(aggregatorPair, aggregatorAddress).send()

      dispatch(toggleActionFullScreenLoader(true))
      dispatch(toggleActionCompletion(true))
      dispatch(showToaster(TOASTER_INFO, `Registering Aggregator...`, ACTION_START_MESSAGE_TEXT))

      // turn off fs actions loader and start data updating after 5s after operation started
      setTimeout(async () => {
        await dispatch(toggleActionFullScreenLoader(false))
        await dispatch(
          showToaster(
            TOASTER_LOADING,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.title,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.message,
          ),
        )

        // @ts-ignore don't have proper type to access data, type has only methods
        const currentOperationLevel = transaction?.lastHead?.header?.level

        // re-fetch data we need
        await checkIndexerLevelAndRunDataUpdateCallback({
          callback: async () => {
            // Add here call for update data actions
            await dispatch(getSatelliteGovernanceStorage())
            await dispatch(hideToaster())
            await dispatch(showToaster(TOASTER_SUCCESS, `Aggregator Registered`, ACTION_COMPLETION_MESSAGE_TEXT))
            await dispatch(toggleActionCompletion(false))
          },
          currentOperationLevel,
        })
      }, 5000)
    } catch (error) {
      console.error('Register Aggregator error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
      }
      dispatch(toggleActionFullScreenLoader(false))
      dispatch(toggleActionCompletion(false))
    }
  }

// Fix Mistaken Transfer
export const fixMistakenTransfer =
  (targetContractAddress: string, purpose: string, transferList: SatelliteGovernanceTransfer[]) =>
  async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    if (!state.wallet.accountPkh) {
      dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    try {
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.governanceSatelliteAddress.address)
      const transaction = await contract?.methods
        .fixMistakenTransfer(targetContractAddress, purpose, transferList)
        .send()

      dispatch(toggleActionFullScreenLoader(true))
      dispatch(toggleActionCompletion(true))
      dispatch(showToaster(TOASTER_INFO, `Fix Mistaken Transfer started...`, ACTION_START_MESSAGE_TEXT))

      // turn off fs actions loader and start data updating after 5s after operation started
      setTimeout(async () => {
        await dispatch(toggleActionFullScreenLoader(false))
        await dispatch(
          showToaster(
            TOASTER_LOADING,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.title,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.message,
          ),
        )

        // @ts-ignore don't have proper type to access data, type has only methods
        const currentOperationLevel = transaction?.lastHead?.header?.level

        // re-fetch data we need
        await checkIndexerLevelAndRunDataUpdateCallback({
          callback: async () => {
            // Add here call for update data actions
            await dispatch(getSatelliteGovernanceStorage())

            await dispatch(hideToaster())
            await dispatch(
              showToaster(TOASTER_SUCCESS, `Fixing Mistaken Transfer triggered`, ACTION_COMPLETION_MESSAGE_TEXT),
            )
            await dispatch(toggleActionCompletion(false))
          },
          currentOperationLevel,
        })
      }, 5000)
    } catch (error) {
      console.error('Fix Mistaken Transfer error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
      }
      dispatch(toggleActionFullScreenLoader(false))
      dispatch(toggleActionCompletion(false))
    }
  }
