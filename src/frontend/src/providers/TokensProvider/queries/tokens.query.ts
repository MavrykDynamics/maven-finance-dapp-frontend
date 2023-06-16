import { gql } from 'utils/__generated__'

// feeds subsciption
export const SUBSCRIBE_TOKENS_METADATA = gql(`
  subscription tokensMetadata {
    token {
      token_id
      metadata
      token_address
      token_standard

      # check whether tokens is collateral token
      lending_controller_collateral_tokens {
        token_name
        protected
      }

      # check whether tokens is loan token
      lending_controller_loan_tokens {
        loan_token_name
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
