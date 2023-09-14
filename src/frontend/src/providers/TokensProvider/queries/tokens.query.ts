import { gql } from 'utils/__generated__'

export const QUERY_TOKENS_METADATA = gql(`
  query tokensMetadata {
    token {
      token_id
      metadata
      token_address
      token_standard

      # check whether tokens is collateral token
      lending_controller_collateral_tokens {
        token_name
        paused
        is_scaled_token
        is_staked_token
      }

      # check whether tokens is loan token
      lending_controller_loan_tokens {
        loan_token_name
        min_repayment_amount
      }

      # check whether tokens is mToken
      m_tokens {
        metadata
        address
      }

      # check that it's real MVK token
      mvk_tokens {
        address
      }
    }
  }
`)
