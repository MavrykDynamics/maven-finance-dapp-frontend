import { CouncilTabsType } from 'providers/CouncilProvider/helpers/council.types'
import {
  MY_PENDING_COUNSIL_TAB,
  MY_PAST_COUNSIL_TAB,
  ALL_PENDING_COUNSIL_TAB,
  ALL_PAST_COUNSIL_TAB,
} from './council.consts'

export const parseCounsilTab = (tabId = ''): CouncilTabsType => {
  switch (tabId) {
    case MY_PENDING_COUNSIL_TAB:
      return MY_PENDING_COUNSIL_TAB
    case MY_PAST_COUNSIL_TAB:
      return MY_PAST_COUNSIL_TAB
    case ALL_PENDING_COUNSIL_TAB:
      return ALL_PENDING_COUNSIL_TAB
    case ALL_PAST_COUNSIL_TAB:
      return ALL_PAST_COUNSIL_TAB
    default:
      return null
  }
}
