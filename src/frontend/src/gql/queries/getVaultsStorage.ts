export const VAULTS_STORAGE_QUERY = `
  query GetAllVaultsStorage {
    lending_controller(where: {mock_time: {_eq: true}}) {
      address
      interest_rate_decimals
      liquidation_delay_in_minutes
      liquidation_ratio
      collateral_ratio
      max_vault_liquidation_pct
      admin_liquidation_fee_pct
      liquidation_fee_pct
      decimals
      minimum_loan_fee_pct

      loan_tokens {
        current_interest_rate
      }

      vaults {
        collateral_balances {
          balance
          token {
            token_name
            token_address
            oracle_id
          }
        }

        vault {
          creation_timestamp
          address
          depositors {
            depositor_id
          }
        }

        last_updated_block_level
        owner_id
        id
        marked_for_liquidation_level
        loan_outstanding_total
        loan_interest_total
        loan_decimals
        liquidation_end_level
        internal_id
        loan_token {
          loan_token_name
          loan_token_address
          loan_token_contract_standard
          oracle_id
        }
      }
    }
  }
`

export const VAULTS_STORAGE_QUERY_NAME = 'GetAllVaultsStorage'
export const VAULTS_STORAGE_QUERY_VARIABLE = {}

export const ORACLE_AGGREGATOR_LATEST_PRICE_QUERY = `
  query GetOracleAggregatorLatestPrice($_eq: String = "") {
    aggregator(where: {address: {_eq: $_eq}}) {
      decimals
      last_completed_data
    }
  }
`
export const ORACLE_AGGREGATOR_LATEST_PRICE_QUERY_NAME = 'GetOracleAggregatorLatestPrice'
export function ORACLE_AGGREGATOR_LATEST_PRICE_QUERY_VARIABLE(_eq: string) {
  return { _eq }
}
