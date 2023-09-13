import { SlidingTabButtonType } from 'app/App.components/SlidingTabButtons/SlidingTabButtons.controller'
import { CouncilTabsType } from 'providers/CouncilProvider/helpers/council.types'

export const MY_PENDING_COUNSIL_TAB = ''
export const MY_PAST_COUNSIL_TAB = 'my-past-actions'
export const ALL_PENDING_COUNSIL_TAB = 'pending-actions'
export const ALL_PAST_COUNSIL_TAB = 'past-actions'

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

export const councilTabsList: SlidingTabButtonType[] = [
  {
    text: 'My Ongoing Actions',
    id: 1,
    active: true,
  },
  {
    text: 'My Past Actions',
    id: 2,
    active: false,
  },
]
