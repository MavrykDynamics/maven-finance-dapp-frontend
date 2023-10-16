// types
import { CouncilActionsParamsColumnsType, CouncilContractsMultiselectOptionType } from './council.types'
import { CouncilActionType } from 'providers/CouncilProvider/council.provider.types'
import {
  CouncilActionParamsNames,
  CouncilTabsType,
  CouncilsActionsIds,
} from 'providers/CouncilProvider/helpers/council.types'

// consts
import {
  MY_PENDING_COUNSIL_TAB,
  MY_PAST_COUNSIL_TAB,
  ALL_PENDING_COUNSIL_TAB,
  ALL_PAST_COUNSIL_TAB,
} from './council.consts'
import { COUNCIL_ACTIONS_PARAMS_MAPPER } from 'providers/CouncilProvider/helpers/council.consts'
import { BYTES_ADDRESS_TYPE, BYTES_STRING_TYPE, convertBytes } from 'utils/convertBytes'

// view
import CustomLink from 'app/App.components/CustomLink/CustomLink'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'

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
 *
 * @param columnData type of value see CouncilActionsToSignColumnsType[CouncilsActionsIds]['type'] and sufix in case we need to add token name after it's amount
 * @param convertedParamValue unpacked param value bytes, if need converted to client format
 * @param name name of the parameter
 * @returns ReactNode to output to user
 */
export const getCellValueContent = (
  columnData: NonNullable<NonNullable<CouncilActionsParamsColumnsType[CouncilsActionsIds]>[CouncilActionParamsNames]>,
  convertedParamValue: string,
) => {
  const { type, sufix, cellName } = columnData

  return type === 'number' ? (
    <CommaNumber value={parseFloat(convertedParamValue)} endingText={sufix} />
  ) : type === 'url' ? (
    <CustomLink to={convertedParamValue}>{convertedParamValue}</CustomLink>
  ) : type === 'address' ? (
    <TzAddress tzAddress={convertedParamValue} hasIcon />
  ) : type === 'image' ? (
    <ImageWithPlug imageLink={convertedParamValue} alt={`${cellName} image`} />
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

  // TODO: remove const, when i will be able to parse bytes correct
  const parsedValue =
    name === COUNCIL_ACTIONS_PARAMS_MAPPER.contractAddressSet
      ? 'KT1AfwRu3nnJssadd3Kt1QCaiWegzAtbV5nt, KT1SvwgLduScCvQNnh5tDZdbcaDwvj8EXtBK, KT1DXcoFzHTLbYc25t14BxAu5qu14c5KVpwS, KT1NHiQPdsMJTxLTYSXwutw4aqyZTLRtipav'
      : convertBytes(value, bytesType)

  return { parsedValue, name, columnData: actionParamsCells[name] }
}
