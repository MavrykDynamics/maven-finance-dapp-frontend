import { HIDE_TOASTER, SHOW_TOASTER } from '../app/App.components/Toaster/Toaster.actions'
import { ERROR } from '../app/App.components/Toaster/Toaster.constants'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'

export type ToasterState = {
  status: string
  title: string
  message: string
} | null

const toasterDefaultState: ToasterState = null

export function toaster(state = toasterDefaultState, action: Action) {
  switch (action.type) {
    case SHOW_TOASTER:
      return {
        ...state,
        ...action,
      }
    case HIDE_TOASTER:
      return null
    default:
      return state
  }
}
