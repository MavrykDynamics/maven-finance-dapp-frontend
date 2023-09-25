export type TokenType = 'tez' | 'fa12' | 'fa2'

// Check for token type
export const ALL_TOKEN_TYPES: Array<TokenType> = ['tez', 'fa12', 'fa2']
export const isValidTokenType = (value: any): value is TokenType => {
  return ALL_TOKEN_TYPES.includes(value)
}
