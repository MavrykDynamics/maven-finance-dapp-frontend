import { ToasterStatusType } from 'app/App.components/Toaster/Toaster.constants'
import { HIDE_TOASTER, SHOW_TOASTER } from '../app/App.components/Toaster/Toaster.actions'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'

export type ToasterState = {
  status: ToasterStatusType
  title: string
  message: string
} | null

const toasterDefaultState: ToasterState = null

export function toaster(state = toasterDefaultState, action: Action) {
  switch (action.type) {
    case SHOW_TOASTER:
      return {
        ...action,
      }
    case HIDE_TOASTER:
      return null
    default:
      return state
  }
}
