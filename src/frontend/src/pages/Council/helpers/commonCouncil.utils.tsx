// types
import { CouncilActionsParamsColumnsType, CouncilContractsMultiselectOptionType } from './council.types'
import { CouncilActionType } from 'providers/CouncilProvider/council.provider.types'
import {
  CouncilActionParamsNames,
  CouncilsActionsIds,
  CouncilTabsType,
} from 'providers/CouncilProvider/helpers/council.types' // consts
import {
  ALL_PAST_COUNCIL_TAB,
  ALL_PENDING_COUNCIL_TAB,
  MY_PAST_COUNCIL_TAB,
  MY_PENDING_COUNCIL_TAB,
} from './council.consts'
import { COUNCIL_ACTIONS_PARAMS_MAPPER } from 'providers/CouncilProvider/helpers/council.consts'
import { BYTES_ADDRESS_TYPE, BYTES_STRING_TYPE, convertBytes } from 'utils/convertBytes' // view
import CustomLink from 'app/App.components/CustomLink/CustomLink'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'

export const parseCouncilTab = (tabId = ''): CouncilTabsType => {
  switch (tabId) {
    case MY_PENDING_COUNCIL_TAB:
      return MY_PENDING_COUNCIL_TAB
    case MY_PAST_COUNCIL_TAB:
      return MY_PAST_COUNCIL_TAB
    case ALL_PENDING_COUNCIL_TAB:
      return ALL_PENDING_COUNCIL_TAB
    case ALL_PAST_COUNCIL_TAB:
      return ALL_PAST_COUNCIL_TAB
    default:
      return null
  }
}

export const handleBgCouncilContractSearch = (contract: CouncilContractsMultiselectOptionType, searchValue: string) =>
  contract.label.toLowerCase().includes(searchValue.toLowerCase()) ||
  contract.address.toLowerCase().includes(searchValue.toLowerCase())

/**
 *
 * @param columnData type of value see CouncilActionsToSignColumnsType[CouncilsActionsIds]['type'] and suffix in case we need to add token name after it's amount
 * @param convertedParamValue unpacked param value bytes, if need converted to client format
 * @param name name of the parameter
 * @returns ReactNode to output to user
 */
export const getCellValueContent = (
  columnData: NonNullable<NonNullable<CouncilActionsParamsColumnsType[CouncilsActionsIds]>[CouncilActionParamsNames]>,
  convertedParamValue: string,
) => {
  const { type, suffix, cellName } = columnData

  return type === 'number' ? (
    <CommaNumber value={parseFloat(convertedParamValue)} endingText={suffix} />
  ) : type === 'url' ? (
    <CustomLink to={convertedParamValue}>{convertedParamValue}</CustomLink>
  ) : type === 'address' ? (
    <TzAddress tzAddress={convertedParamValue} hasIcon />
  ) : type === 'image' ? (
    <ImageWithPlug imageLink={convertedParamValue} alt={`${cellName} image`} useRounded />
  ) : (
    <div className="text">{convertedParamValue}</div>
  )
}

/**
 *
 * @param actionParam parameters of action from back-end
 * @returns unpacked bytes value, param name and param parsed name, and column data (grid-area classname, value type)
 */
export const getCellData = (
  actionParam: CouncilActionType['parameters'][number],
  actionParamsCells: NonNullable<CouncilActionsParamsColumnsType[CouncilsActionsIds]>,
) => {
  const { name, value } = actionParam

  const bytesType =
    name === COUNCIL_ACTIONS_PARAMS_MAPPER.keyHash ||
    name === COUNCIL_ACTIONS_PARAMS_MAPPER.newAdminAddress ||
    name === COUNCIL_ACTIONS_PARAMS_MAPPER.vesteeAddress ||
    name === COUNCIL_ACTIONS_PARAMS_MAPPER.receiverAddress ||
    name === COUNCIL_ACTIONS_PARAMS_MAPPER.councilMemberAddress ||
    name === COUNCIL_ACTIONS_PARAMS_MAPPER.tokenContractAddress ||
    name === COUNCIL_ACTIONS_PARAMS_MAPPER.targetContractAddress ||
    name === COUNCIL_ACTIONS_PARAMS_MAPPER.newCouncilMemberAddress ||
    name === COUNCIL_ACTIONS_PARAMS_MAPPER.oldCouncilMemberAddress ||
    name === COUNCIL_ACTIONS_PARAMS_MAPPER.treasuryAddress
      ? BYTES_ADDRESS_TYPE
      : BYTES_STRING_TYPE

  // TODO: hadrcoded case for contractAddressesSetParam, need to add BYTES_SET_ADDRESS_TYPE into convertBytes,
  // and return string for this case in format 'address1, address2, address3, ...' for BYTES_SET_ADDRESS_TYPE from convertBytes
  if (name === COUNCIL_ACTIONS_PARAMS_MAPPER.contractAddressSet) {
    return { parsedValue: value, name, columnData: actionParamsCells[name] }
  }

  const parsedValue = convertBytes(value, bytesType)

  return { parsedValue, name, columnData: actionParamsCells[name] }
}
