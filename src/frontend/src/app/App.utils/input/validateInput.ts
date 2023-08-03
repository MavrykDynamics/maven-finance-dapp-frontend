import { validateAsciiInput } from './validateAsciiInput'
import { INPUT_ASCII_TEXT } from './input.consts'
import { INPUT_MAX_LIMIT_TOAST_TEXT, defaultLargeInputMaxLength } from 'app/App.components/Input/Input.constants'

/**
 *you can extend this function with more validators
 * @param value string representation of input
 * @returns string error message | ''
 */
export function validateInput(value: string) {
  if (!validateAsciiInput(value)) return INPUT_ASCII_TEXT

  return ''
}

export function validateInputLength(value: string, limit = defaultLargeInputMaxLength) {
  if (value.length > limit) {
    return INPUT_MAX_LIMIT_TOAST_TEXT
  }

  return ''
}
