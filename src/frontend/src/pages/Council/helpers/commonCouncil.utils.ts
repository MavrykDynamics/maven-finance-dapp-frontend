import { CouncilContractsMultiselectOptionType } from './council.types'
import { CouncilTabsType, CouncilsFormsIds } from 'providers/CouncilProvider/helpers/council.types'
import {
  MY_PENDING_COUNSIL_TAB,
  MY_PAST_COUNSIL_TAB,
  ALL_PENDING_COUNSIL_TAB,
  ALL_PAST_COUNSIL_TAB,
  BgCounsilDdForms,
  COUNCIL_FORMS_NAMES_MAPPER,
  MavrykCounsilDdForms,
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

export const handleBgCouncilContractSearch = (contract: CouncilContractsMultiselectOptionType, searchValue: string) =>
  contract.label.toLowerCase().includes(searchValue.toLowerCase()) ||
  contract.address.toLowerCase().includes(searchValue.toLowerCase())
