import {
  Dipdup_Token_Metadata,
  M_Token,
  Treasury,
  Governance_Financial_Whitelist_Token_Contract,
  Token,
} from 'utils/generated/graphqlTypes'

// Normalize Tokens
export function normalizeDipDupTokens(token?: Array<Token>) {
  return token ?? []
}

export function normalizeMTokens(m_token: M_Token) {
  return m_token || []
}

export function normalizeWhitelistTokens(whitelistTokens: Array<Treasury>) {
  return (
    (whitelistTokens?.[0]?.whitelist_token_contracts ?? ([] as Array<Governance_Financial_Whitelist_Token_Contract>))
      .map((tokenInfo) => ({
        symbol: tokenInfo.contract_name,
        address: tokenInfo.contract_address,
        shortSymbol: tokenInfo.token.token_standard,
        id: 0,
      }))
      // TODO: remove this filter when back-end is ready for this
      .filter(({ symbol, shortSymbol }) => shortSymbol && symbol.toLowerCase() === 'mvk')
  )
}
