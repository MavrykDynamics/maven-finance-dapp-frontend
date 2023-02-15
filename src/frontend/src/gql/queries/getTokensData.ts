export const DIPDUP_TOKENS_QUERY = `
   query GetDipDupTokens {
    dipdup_token_metadata {
      contract
      created_at
      metadata
      id
      network
      update_id
      updated_at
    }
  }
`
export const DIPDUP_TOKENS_QUERY_NAME = 'GetDipDupTokens'
export const DIPDUP_TOKENS_QUERY_VARIABLE = {}

export const DIPDUP_CONTRACTS_QUERY = `
  query GetDipDupContracts{
    dipdup_contract_metadata {
      contract
      created_at
      metadata
      id
      network
      update_id
      updated_at
    }
  }
`
export const DIPDUP_CONTRACTS_QUERY_NAME = 'GetDipDupContracts'
export const DIPDUP_CONTRACTS_QUERY_VARIABLE = {}

export const GOVERNANCE_CONTRACT_ADDRESS_QUERY = `
  query GetContractAddress {
    governance(where: {active: {_eq: true}}) {
      general_contracts(where: {contract_name: {_eq: "paymentTreasury"}}) {
        contract_address
      }
    }
  }
`
export const GOVERNANCE_CONTRACT_ADDRESS_NAME = 'GetContractAddress'
export const GOVERNANCE_CONTRACT_ADDRESS_VARIABLE = {}

export const WHITELIST_TOKENS_QUERY = `
  query getWhiteListTokensForContract ($_contractAddress: String){
    treasury(where: {address: {_eq: $_contractAddress}}) {
      whitelist_token_contracts {
        contract_address
        contract_name
        token_contract_standard
      }
    }
  }
`
export const WHITELIST_TOKENS_NAME = 'getWhiteListTokensForContract'
export function WHITELIST_TOKENS_VARIABLE(address: string) {
  return { _contractAddress: address }
}

export const M_TOKENS_QUERY = `
  query getMTokensForContract {
    m_token {
      accounts {
        user_id
        m_token_id
      }
      address
      admin
      loan_token_name
    }
  }
`
export const M_TOKENS_QUERY_NAME = 'getMTokensForContract'
