import type { State } from 'reducers'
import type { AppDispatch, GetState } from '../../App.controller'
import { TOASTER_LOADING, ToasterStatusType } from './Toaster.constants'
import { sleep } from 'utils/api/sleep'

export const SHOW_TOASTER = 'SHOW_TOASTER'
export const HIDE_TOASTER = 'HIDE_TOASTER'

export const showToaster =
  (status: ToasterStatusType, title: string, message: string, timeout: number = 4000) =>
  async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    // if we show loader toaster, turn it off, and show new toaster
    if (state.toaster?.status === TOASTER_LOADING && status !== TOASTER_LOADING) {
      dispatch(hideToaster())

      // need sleep to perform transition
      await sleep(1300)

      dispatch(showToaster(status, title, message))
    }

    // If we don't show toaster, show it
    if (!state.toaster) {
      dispatch({
        type: SHOW_TOASTER,
        status,
        title,
        message,
      })

      // Loader toaster should be turned off by hide action, cuz we don't know when loading finisheings
      if (status !== TOASTER_LOADING) {
        await sleep(timeout)
        dispatch(hideToaster())
      }
    }
  }

export const hideToaster = () => (dispatch: AppDispatch) =>
  dispatch({
    type: HIDE_TOASTER,
  })
