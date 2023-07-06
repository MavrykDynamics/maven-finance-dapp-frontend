export type TokenType = 'tez' | 'fa12' | 'fa2'

// Check for token type
const ALL_TOKEN_TYPES = ['tez', 'fa12', 'fa2']
export const isValidTokenType = (value: any): value is TokenType => {
  return ALL_TOKEN_TYPES.includes(value)
}
