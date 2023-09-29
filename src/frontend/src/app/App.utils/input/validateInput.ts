import { validateAsciiInput } from './validateAsciiInput'
import { INPUT_ASCII_TEXT } from './input.consts'
import {
  INPUT_MAX_LIMIT_TOAST_TEXT,
  INPUT_MIN_LIMIT_TOAST_TEXT,
  defaultLargeInputMaxLength,
} from 'app/App.components/Input/Input.constants'

/**
 *you can extend this function with more validators
 * @param value string representation of input
 * @returns a tuple where tuple[0] indicates for error (f.e. hasError), tuple[1] is the actual err message
 */
export function validateInput(value: string) {
  if (!validateAsciiInput(value)) return [true, INPUT_ASCII_TEXT] as const

  return [false, null] as const
}

/**
 *
 * @param value input value
 * @param limit max input length
 * @returns a tuple where tuple[0] indicates for error (f.e. hasError), tuple[1] is the actual err message
 */
export function validateInputLength(value: string, limit = defaultLargeInputMaxLength) {
  if (value.length > limit) {
    return [true, INPUT_MAX_LIMIT_TOAST_TEXT] as const
  }

  if (value.trim().length === 0) {
    return [true, INPUT_MIN_LIMIT_TOAST_TEXT] as const
  }

  return [false, null] as const
}
