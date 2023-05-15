import type { State } from 'reducers'
import type { AppDispatch, GetState } from '../../App.controller'
import { TOASTER_LOADING, ToasterStatusType } from './Toaster.constants'

export const SHOW_TOASTER = 'SHOW_TOASTER'
export const HIDE_TOASTER = 'HIDE_TOASTER'

export const showToaster =
  (status: ToasterStatusType, title: string, message: string, timeout: number = 4000) =>
  (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    // if we have toaster loader showing, turn it of, and show new toaster
    if (state.toaster?.status === TOASTER_LOADING && status !== TOASTER_LOADING) {
      dispatch(hideToaster())

      dispatch({
        type: SHOW_TOASTER,
        status,
        title,
        message,
      })

      // Loader toaster should be turned off by hide action, cuz we don't know when loading finisheings
      if (status !== TOASTER_LOADING) {
        const timeoutId = setTimeout(() => {
          dispatch(hideToaster())
          clearTimeout(timeoutId)
        }, timeout)
      }
    }

    // If we don't have toaster showing, show it
    if (!state.toaster) {
      dispatch({
        type: SHOW_TOASTER,
        status,
        title,
        message,
      })

      // Loader toaster should be turned off by hide action, cuz we don't know when loading finisheings
      if (status !== TOASTER_LOADING) {
        const timeoutId = setTimeout(() => {
          dispatch(hideToaster())
          clearTimeout(timeoutId)
        }, timeout)
      }
    }
  }

export const hideToaster = () => (dispatch: AppDispatch) =>
  dispatch({
    type: HIDE_TOASTER,
  })
