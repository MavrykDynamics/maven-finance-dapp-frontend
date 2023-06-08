import { validateAsciiInput } from './validateAsciiInput'
import { INPUT_ASCII_TEXT } from './input.consts'

/**
 *you can extend this function with more validators
 * @param value string representation of input
 * @returns string error message | ''
 */
export function validateInput(value: string) {
  if (!validateAsciiInput(value)) return INPUT_ASCII_TEXT

  return ''
}
