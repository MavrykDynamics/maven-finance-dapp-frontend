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

/**
 * helper to get action id on client and then use this id for getting grid styles for output, etc
 *
 * @param actionName action name from indexer
 * @returns action id on client
 */
export const getClientActionIdByName = (actionName: string): CouncilsFormsIds | null => {
  switch (actionName) {
    // ------- MAVRYK COUNCIL MEMBERS FORMS
    case COUNCIL_FORMS_NAMES_MAPPER[MavrykCounsilDdForms.ADD_COUNCIL_MEMBER]:
      return MavrykCounsilDdForms.ADD_COUNCIL_MEMBER
    case COUNCIL_FORMS_NAMES_MAPPER[MavrykCounsilDdForms.CHANGE_COUNCIL_MEMBER]:
      return MavrykCounsilDdForms.CHANGE_COUNCIL_MEMBER
    case COUNCIL_FORMS_NAMES_MAPPER[MavrykCounsilDdForms.REMOVE_COUNCIL_MEMBER]:
      return MavrykCounsilDdForms.REMOVE_COUNCIL_MEMBER

    // ------- MAVRYK COUNCIL VESTEES FORMS
    case COUNCIL_FORMS_NAMES_MAPPER[MavrykCounsilDdForms.ADD_VESTEE]:
      return MavrykCounsilDdForms.ADD_VESTEE
    case COUNCIL_FORMS_NAMES_MAPPER[MavrykCounsilDdForms.UPDATE_VESTEE]:
      return MavrykCounsilDdForms.UPDATE_VESTEE
    case COUNCIL_FORMS_NAMES_MAPPER[MavrykCounsilDdForms.TOGGLE_VESTEE_LOCK]:
      return MavrykCounsilDdForms.TOGGLE_VESTEE_LOCK
    case COUNCIL_FORMS_NAMES_MAPPER[MavrykCounsilDdForms.REMOVE_VESTEE]:
      return MavrykCounsilDdForms.REMOVE_VESTEE

    // ------- MAVRYK COUNCIL TOKENS FORMS
    case COUNCIL_FORMS_NAMES_MAPPER[MavrykCounsilDdForms.REQUEST_TOKENS]:
      return MavrykCounsilDdForms.REQUEST_TOKENS
    case COUNCIL_FORMS_NAMES_MAPPER[MavrykCounsilDdForms.REQUEST_TOKEN_MINT]:
      return MavrykCounsilDdForms.REQUEST_TOKEN_MINT
    case COUNCIL_FORMS_NAMES_MAPPER[MavrykCounsilDdForms.TRANSFER_TOKENS]:
      return MavrykCounsilDdForms.TRANSFER_TOKENS

    // ------- MAVRYK COUNCIL BAKERS FORMS
    case COUNCIL_FORMS_NAMES_MAPPER[MavrykCounsilDdForms.SET_BAKER]:
      return MavrykCounsilDdForms.SET_BAKER
    case COUNCIL_FORMS_NAMES_MAPPER[MavrykCounsilDdForms.SET_CONTRACT_BAKER]:
      return MavrykCounsilDdForms.SET_CONTRACT_BAKER

    // ------- MAVRYK COUNCIL OTHER FORMS
    case COUNCIL_FORMS_NAMES_MAPPER[MavrykCounsilDdForms.DROP_FINANCIAL_REQUEST]:
      return MavrykCounsilDdForms.DROP_FINANCIAL_REQUEST

    // ------- BREAG GLASS COUNCIL MEMBERS FORMS
    case COUNCIL_FORMS_NAMES_MAPPER[BgCounsilDdForms.BG_ADD_COUNCIL_MEMBER]:
      return BgCounsilDdForms.BG_ADD_COUNCIL_MEMBER
    case COUNCIL_FORMS_NAMES_MAPPER[BgCounsilDdForms.BG_CHANGE_COUNCIL_MEMBER]:
      return BgCounsilDdForms.BG_CHANGE_COUNCIL_MEMBER
    case COUNCIL_FORMS_NAMES_MAPPER[BgCounsilDdForms.BG_REMOVE_COUNCIL_MEMBER]:
      return BgCounsilDdForms.BG_REMOVE_COUNCIL_MEMBER

    // ------- BREAG GLASS COUNCIL CONTRACTS ADMIN FORMS
    case COUNCIL_FORMS_NAMES_MAPPER[BgCounsilDdForms.SET_ALL_CONTRACTS_ADMIN]:
      return BgCounsilDdForms.SET_ALL_CONTRACTS_ADMIN
    case COUNCIL_FORMS_NAMES_MAPPER[BgCounsilDdForms.SET_SELECTED_CONTRACTS_ADMIN]:
      return BgCounsilDdForms.SET_SELECTED_CONTRACTS_ADMIN

    // ------- BREAG GLASS COUNCIL CONTRACTS OTHER FORMS
    case COUNCIL_FORMS_NAMES_MAPPER[BgCounsilDdForms.REMOVE_BREAK_GLASS_CONTROLL]:
      return BgCounsilDdForms.REMOVE_BREAK_GLASS_CONTROLL
    case COUNCIL_FORMS_NAMES_MAPPER[BgCounsilDdForms.SIGN_ACTION]:
      return BgCounsilDdForms.SIGN_ACTION
    case COUNCIL_FORMS_NAMES_MAPPER[BgCounsilDdForms.UNPAUSE_ALL_ENTRYPOINTS]:
      return BgCounsilDdForms.UNPAUSE_ALL_ENTRYPOINTS

    default:
      return null
  }
}
