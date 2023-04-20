import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from 'app/App.components/Toaster/Toaster.constants'
import { getSatellitesStorage } from 'pages/Satellites/Satellites.actions'
import { State } from 'reducers'
import { RegisterAsSatelliteForm } from '../../utils/TypesAndInterfaces/Forms'
import type { AppDispatch, GetState } from '../../app/App.controller'
import { toggleActionFulScreenLoader } from 'app/App.components/Loader/Loader.action'
import { DAPP_INSTANCE } from 'app/App.components/ConnectWallet/ConnectWallet.actions'

export const registerAsSatellite =
  (form: RegisterAsSatelliteForm) => async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    if (!state.wallet.accountPkh) {
      dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    if (state.loading.isActiveFullScreenLoader) {
      dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
      return
    }

    try {
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.delegationAddress.address)

      const transaction = await contract?.methods
        .registerAsSatellite(
          form.name,
          form.description,
          form.image,
          form.website,
          form.fee * 100,
          form.publicKey,
          form.peerId,
        )
        .send()

      dispatch(toggleActionFulScreenLoader(true))
      dispatch(showToaster(INFO, 'Registering...', 'Please wait 30s'))

      await transaction?.confirmation()

      dispatch(showToaster(SUCCESS, 'Satellite Registered.', 'All good :)'))

      dispatch(getSatellitesStorage())
      dispatch(toggleActionFulScreenLoader(false))
    } catch (error) {
      if (error instanceof Error) {
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      dispatch(toggleActionFulScreenLoader(false))
    }
  }

export const updateSatelliteRecord =
  (form: RegisterAsSatelliteForm) => async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    if (!state.wallet.accountPkh) {
      dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    if (state.loading.isActiveFullScreenLoader) {
      dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
      return
    }

    try {
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.delegationAddress.address)

      const transaction = await contract?.methods
        .updateSatelliteRecord(
          form.name,
          form.description,
          form.image,
          form.website,
          form.fee * 100,
          form.publicKey,
          form.peerId,
        )
        .send()

      dispatch(toggleActionFulScreenLoader(true))
      dispatch(showToaster(INFO, 'Registering...', 'Please wait 30s'))

      await transaction?.confirmation()

      dispatch(showToaster(SUCCESS, 'Satellite Registered.', 'All good :)'))

      dispatch(getSatellitesStorage())
      dispatch(toggleActionFulScreenLoader(false))
    } catch (error) {
      if (error instanceof Error) {
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      dispatch(toggleActionFulScreenLoader(false))
    }
  }

export const unregisterAsSatellite = () => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  if (!state.wallet.accountPkh) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  if (state.loading.isActiveFullScreenLoader) {
    dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
    return
  }

  try {
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(state.contractAddresses.delegationAddress.address)

    const transaction = await contract?.methods.unregisterAsSatellite(state.wallet.accountPkh).send()

    dispatch(toggleActionFulScreenLoader(true))
    dispatch(showToaster(INFO, 'Unregistering...', 'Please wait 30s'))

    await transaction?.confirmation()

    dispatch(showToaster(SUCCESS, 'Satellite is no longer registered.', 'All good :)'))

    dispatch(getSatellitesStorage())
    dispatch(toggleActionFulScreenLoader(false))
  } catch (error) {
    if (error instanceof Error) {
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    dispatch(toggleActionFulScreenLoader(false))
  }
}
