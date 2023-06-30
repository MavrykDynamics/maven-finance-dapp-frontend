export const SPECIFIC_CONTRACT_ERROR_CODES: Map<string, { message: string; description: string }> = new Map([
  ['storage_exhausted', { message: 'storage_exhausted', description: 'Error: storage exhausted' }],
  ['non_printable_character', { message: 'non_printable_character', description: 'Error: Non printable character' }],
  ['FA2_INSUFFICIENT_BALANCE', { message: 'FA2_INSUFFICIENT_BALANCE', description: 'Error: FA2 insufficient balance' }],
  ['FA2_NOT_OPERATOR', { message: 'FA2_NOT_OPERATOR', description: 'Error: FA2 not operator' }],
  [
    'FA12_INSUFFICIENT_BALANCE',
    { message: 'FA12_INSUFFICIENT_BALANCE', description: 'Error: FA12 insufficient balance' },
  ],
])
