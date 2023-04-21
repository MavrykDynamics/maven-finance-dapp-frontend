import type { State } from 'reducers'
import type { AppDispatch, GetState } from '../../App.controller'
import { TOASTER_LOADING, ToasterStatusType } from './Toaster.constants'

export const SHOW_TOASTER = 'SHOW_TOASTER'
export const HIDE_TOASTER = 'HIDE_TOASTER'

export const showToaster =
  (status: ToasterStatusType, title: string, message: string, timeout: number = 4000) =>
  (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    if (!state.toaster) {
      dispatch({
        type: SHOW_TOASTER,
        status,
        title,
        message,
      })

      if (status !== TOASTER_LOADING) {
        setTimeout(() => {
          dispatch(hideToaster())
        }, timeout)
      }
    }
  }

export const hideToaster = () => (dispatch: AppDispatch) =>
  dispatch({
    type: HIDE_TOASTER,
  })
