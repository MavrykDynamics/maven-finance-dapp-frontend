import { gql } from 'utils/__generated__'

// feeds subsciption
export const SUBSCRIBE_TOKENS_METADATA = gql(`
  subscription tokensMetadata {
    token {
      metadata
      token_address
      token_standard

      # check whether tokens is collateral token
      lending_controller_collateral_tokens {
        token_name
      }
      # check whether tokens is mToken
      m_tokens {
        address
      }

      # check that it's real MVK token
      mvk_tokens {
        address
      }
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

export const GOVERNANCE_CONTRACT_ADDRESS_QUERY = `
  query GetContractAddress {
    governance {
      general_contracts(where: {contract_name: {_eq: "paymentTreasury"}}) {
        contract_address
        contract_name
      }
    }
  }
`
export const GOVERNANCE_CONTRACT_ADDRESS_NAME = 'GetContractAddress'
export const GOVERNANCE_CONTRACT_ADDRESS_VARIABLE = {}

// TODO: dipdup_token_metadata -> token
export const DAPP_TOKENS_QUERY = `
query DappTokens($_whitelistTokensAddress: String) {
  dipdup_token_metadata {
    contract
    created_at
    metadata
    id
    network
    update_id
    updated_at
  }

  token {
    token_address
    token_standard
    token_id
    metadata
  }

  treasury(where: {address: {_eq: $_whitelistTokensAddress}}) {
    whitelist_token_contracts {
      contract_address
      contract_name
      token {
        token_standard
      }
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
