import { validateAddress, validatePublicKey as taquitoValidatePublicKey } from '@taquito/utils'
import { AllValidFormTypes } from './TypesAndInterfaces/Forms'
import { InputStatusType } from 'app/App.components/Input/Input.constants'
import { RpcClient } from '@taquito/rpc'
import { PreferencesState } from 'providers/DappConfigProvider/dappConfig.provider.types'

const isIPFS = require('is-ipfs')

/**
 * File contains different functions used to validate input throughout the dapp
 * @param input
 */
export function isJsonString(input: string) {
  try {
    JSON.parse(input)
  } catch (e) {
    return false
  }
  return true
}

export function isValidHttpUrl(input: string) {
  let url
  try {
    url = new URL(input)
  } catch (_) {
    return false
  }

  return url.protocol === 'http:' || url.protocol === 'https:'
}

export function isValidIPFSUrl(input: string) {
  return isIPFS.url(input)
}

export function isNotAllWhitespace(input: string) {
  return !(input?.length > 0 && input?.replace(/\s/g, '').length === 0) && input?.length > 0
}

export function isHexadecimalByteString(input: string) {
  const a = parseInt(input, 16)
  return a.toString(16) === input
}

export function isNumberInRange(input: number, minValue = 0, maxValue = 0) {
  if (input >= maxValue || input <= minValue) {
    return false
  } else if (minValue && !maxValue) {
    return input >= minValue
  } else if (!minValue && maxValue) {
    return input <= maxValue
  } else if (minValue && maxValue) {
    return input >= minValue && input <= maxValue
  } else {
    return input > 0
  }
}

export function getFormErrors(form: AllValidFormTypes) {
  const errors: [string, boolean | undefined][] = []
  let errorMessage = 'Please correct:'
  Object.entries(form).forEach((k) => {
    if (!k[1]) {
      errors.push(k)
      errorMessage += ` ${k[0].charAt(0).toUpperCase() + k[0].substr(1)},`
    }
  })
  errorMessage = errorMessage.substr(0, errorMessage.length - 1)
  return { errors, errorMessage: errorMessage }
}

export function mathRoundTwoDigit(digit: string | number | undefined): number | '' {
  return digit ? Math.floor(+digit * 100) / 100 : 0
}

export const containsCode = (str: string) => /<[a-z][\s\S]*>/i.test(str) || /eval/i.test(str)

export function isValidLength(input: string, minLength: number, maxLength: number) {
  if (!input) return false
  return input.length >= minLength && input.length <= maxLength
}

export const isValidRPCNode = async (
  input: string,
  currentRpcNodes: PreferencesState['RPC_NODES'],
): Promise<{ status: boolean; errorMsg: null | string }> => {
  if (!input) return { status: false, errorMsg: null }
  if (currentRpcNodes.find(({ url }) => url.toLowerCase().trim() === input.toLowerCase().trim()))
    return { status: false, errorMsg: 'link is already a default option, please enter in new link.' }

  try {
    const chainPublicKey = 'NetXnHfVqm9iesp'
    const client = new RpcClient(input, chainPublicKey)
    const chainID = await client.getChainId()
    const isValid = chainID === chainPublicKey
    return { status: isValid, errorMsg: isValid ? null : 'link is not valid for RPC node, please enter in new link.' }
  } catch (error) {
    if (error instanceof Error) {
      console.error('RPC node error:', error.message)
    }
    return { status: false, errorMsg: 'link is not valid for RPC node, please enter in new link.' }
  }
}

export const validateText = (text: string, maxLength?: number) => {
  // if maxLength is missing, we check only for an empty field
  const checkMaxLengthField = maxLength ? (isValidLength(text, 1, maxLength) ? 'success' : 'error') : 'success'
  const checkEmptyField = isNotAllWhitespace(text) ? checkMaxLengthField : 'error'

  return checkEmptyField
}

export const validateFormField =
  (setFormInputStatus: (value: React.SetStateAction<Record<string, InputStatusType>>) => void) =>
  (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>, maxLength?: number) => {
    setFormInputStatus((prev) => {
      const { value, name } = e.target
      return { ...prev, [name]: validateText(value, maxLength) }
    })
  }

export const validateFormAddress =
  (setFormInputStatus: (value: React.SetStateAction<Record<string, InputStatusType>>) => void) =>
  (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormInputStatus((prev) => {
      const { value, name } = e.target

      const isValidAddress = validateTzAddress(value) ? 'success' : 'error'
      return { ...prev, [name]: isValidAddress }
    })
  }

export const isHexadecimal = (value: string) => {
  const regex = /[0-9A-Fa-f]{6}/g
  return value.match(regex) ? true : false
}

export const validationResults = {
  0: 'NO_PREFIX_MATCHED',
  1: 'INVALID_CHECKSUM',
  2: 'INVALID_LENGTH',
  3: 'VALID',
}

export const validateTzAddress = (address: string) => {
  const resultNumber = validateAddress(address)

  return validationResults[resultNumber] === validationResults[3] ? true : false
}

export const validatePublicKey = (key: string) => {
  const resultNumber = taquitoValidatePublicKey(key)

  return validationResults[resultNumber] === validationResults[3] ? true : false
}
