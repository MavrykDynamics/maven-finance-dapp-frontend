import { defaultLargeInputMaxLength } from 'app/App.components/Input/Input.constants'
import { INPUT_LIMIT_TEXT } from './input.consts'

export function validateInputLength(value: string, limit = defaultLargeInputMaxLength) {
  if (value.length > limit) return INPUT_LIMIT_TEXT

  return ''
}
