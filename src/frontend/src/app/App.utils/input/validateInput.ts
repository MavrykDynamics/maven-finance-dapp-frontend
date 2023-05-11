import { validateAsciiInput } from './validateAsciiInput'
import { containSpaces } from './containSpaces'
import { INPUT_ASCII_TEXT, INPUT_WHITE_SPACE_TEXT } from './input.consts'

/**
 *you can extend this function with more validators
 * @param value string representation of input
 * @returns string error message | ''
 */
export function validateInput(value: string) {
  if (!validateAsciiInput(value)) return INPUT_ASCII_TEXT
  if (containSpaces(value)) return INPUT_WHITE_SPACE_TEXT

  return ''
}
