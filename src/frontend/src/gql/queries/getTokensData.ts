import { gql } from 'utils/__generated__'

export const MVK_FAUCET_QUERY = `
query MVKFaucet {
  mvk_faucet{
    address
  }
}
`
export const MVK_FAUCET_QUERY_NAME = 'MVKFaucet'

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

export const DAPP_TOKENS_QUERY = `
query DappTokens($_whitelistTokensAddress: String) {
  dipdup_contract_metadata {
    contract
    created_at
    metadata
    id
    network
    update_id
    updated_at
  }

  dipdup_token_metadata {
    contract
    created_at
    metadata
    id
    network
    update_id
    updated_at
  }

  treasury(where: {address: {_eq: $_whitelistTokensAddress}}) {
    whitelist_token_contracts {
      contract_address
      contract_name
      token_contract_standard
    }
  }

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
export const DAPP_TOKENS_QUERY_NAME = 'DappTokens'
export const DAPP_TOKENS_VARIABLE = (address: string) => ({ _whitelistTokensAddress: address })

// tokens context queries

export const GET_GOVERNANCE_CONTRACT_ADDRESS_QUERY = gql(`
query GetContractAddress {
  governance(where: {active: {_eq: true}}) {
    general_contracts(where: {contract_name: {_eq: "paymentTreasury"}}) {
      contract_address
    }
  }
}
`)

export const GET_DAPP_TOKENS_QUERY = gql(`
query DappTokens($_whitelistTokensAddress: String) {
  dipdup_contract_metadata {
    contract
    created_at
    metadata
    id
    network
    update_id
    updated_at
  }

  dipdup_token_metadata {
    contract
    created_at
    metadata
    id
    network
    update_id
    updated_at
  }

  treasury(where: {address: {_eq: $_whitelistTokensAddress}}) {
    whitelist_token_contracts {
      contract_address
      contract_name
      token_contract_standard
    }
  }

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
`)

export const GET_MVK_FAUCET_QUERY = gql(`
query MVKFaucet {
  mvk_faucet{
    address
  }
}
`)
