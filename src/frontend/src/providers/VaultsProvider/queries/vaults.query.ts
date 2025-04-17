// @ts-nocheck

import { gql } from 'utils/__generated__'

export const GET_USER_DEPOSITOR_ALL_VAULTS_QUERY = gql(`
	query getUserDepositorAllVaultsQuery($userAddress: String, $limit: Int, $offset: Int) {
		lending_controller: lending_controller {
			max_vault_liquidation_pct
			decimals
			liquidation_fee_pct
			liquidation_ratio
			interest_rate_decimals
			admin_liquidation_fee_pct
			liquidation_delay_in_minutes

			vaults(order_by: {vault: {creation_timestamp: desc}}, where: {open: {_eq: true}, vault: {_or: [{allowance: {_eq: "0"}}, {_and: {depositors: {depositor: {address: {_eq: $userAddress}}}, allowance: {_eq: "1"}}}]}, owner: {address: {_neq: $userAddress}}}, limit: $limit, offset: $offset) {
				# collaterals of the vault
				collateral_balances {
					balance
					collateral_token {
						token_name
						token {
							token_address
						}
					}
				}

				vault {
					creation_timestamp
					address
					name
					allowance
					baker {
						address
					}
					depositors {
						depositor {
							address
						}
					}
				}

				loan_token {
					token {
						token_address
					}
					current_interest_rate
					borrow_index
					total_remaining
					token_pool_total
					reserve_ratio
					min_repayment_amount
				}

				owner {
					address
				}
				
				last_updated_block_level
				marked_for_liquidation_level
				liquidation_end_level
				loan_outstanding_total
				loan_principal_total
				loan_interest_total
				internal_id
				borrow_index
			}
		}
	}
`)

export const GET_USER_ALL_VAULTS_QUERY = gql(`
	query getUserAllVaultsQuery($userAddress: String, $limit: Int, $offset: Int) {
		lending_controller: lending_controller {
			max_vault_liquidation_pct
			decimals
			liquidation_fee_pct
			liquidation_ratio
			interest_rate_decimals
			admin_liquidation_fee_pct
			liquidation_delay_in_minutes

			vaults(order_by: {vault: {creation_timestamp: desc}}, where: {open: {_eq: true}, owner: {address: {_eq: $userAddress}}}, limit: $limit, offset: $offset) {
				# collaterals of the vault
				collateral_balances {
					balance
					collateral_token {
						token_name
						token {
							token_address
						}
					}
				}

				vault {
					creation_timestamp
					address
					name
					allowance
					baker {
						address
					}
					depositors {
						depositor {
							address
						}
					}
				}

				loan_token {
					token {
						token_address
					}
					current_interest_rate
					borrow_index
					total_remaining
					token_pool_total
					reserve_ratio
					min_repayment_amount
				}

				owner {
					address
				}
				
				last_updated_block_level
				marked_for_liquidation_level
				liquidation_end_level
				loan_outstanding_total
				loan_principal_total
				loan_interest_total
				internal_id
				borrow_index
			}
		}
	}
`)

// get all vaults
// andrew_here replace this query with one I sent you

// example -> query getAllVaultsQuery($limit: Int, $offset: Int)
// see GET_USER_DEPOSITOR_ALL_VAULTS_QUERY how to pass variables on line 3 in this file
// when u update queries - DO NOT FORGET to run this command from console: <yarn graphql-compile>
// test queries in playground https://api.mavenfinance.io/console
export const GET_ALL_VAULTS_QUERY = gql(`
	query getAllVaultsQuery($limit: Int, $offset: Int) {
		# Get lending controller config
		lending_controller: lending_controller {
			max_vault_liquidation_pct
			decimals
			liquidation_fee_pct
			liquidation_ratio
			interest_rate_decimals
			admin_liquidation_fee_pct
			liquidation_delay_in_minutes
		}

		vaults: gql_vault_with_balances(
			order_by: {creation_timestamp: desc}, 
			where: {is_open: {_eq: true}}
			limit: $limit
            offset: $offset
		) {
			vault_address
			vault_name
			owner_address
			loan_token_address
			loan_outstanding_total
			loan_principal_total
			loan_interest_total
			collateral_json
			depositors_json
			is_open
			current_interest_rate
			borrow_index
			total_remaining
			token_pool_total
			reserve_ratio
			min_repayment_amount
			allowance
			creation_timestamp
			baker_address
			last_updated_block_level
			marked_for_liquidation_level
			liquidation_end_level
			internal_id
		}
	}
`)

export const GET_ALL_VAULTS_QUERY_COUNT = gql(`
   query GetVaultCounts {
  totalVaults: vault_aggregate {
    aggregate {
      count
    }
  }

  userOpenVaults: lending_controller_aggregate {
    nodes {
      vaults_aggregate(
        where: {
          open: { _eq: true }
          owner: { address: { _eq: "mv1QjpPmbwQVyye5ecQEC23DCWKvPXV2waBW" } }
        }
      ) {
        aggregate {
          count
        }
      }
    }
  }

  otherOpenVaultsWithAllowance: lending_controller_aggregate {
    nodes {
      vaults_aggregate(
        where: {
          open: { _eq: true }
          vault: {
            _or: [
              { allowance: { _eq: "0" } }
              {
                _and: [
                  {
                    depositors: {
                      depositor: { address: { _eq: "mv1QjpPmbwQVyye5ecQEC23DCWKvPXV2waBW" } }
                    }
                  }
                  { allowance: { _eq: "1" } }
                ]
              }
            ]
          }
          owner: { address: { _neq: "mv1QjpPmbwQVyye5ecQEC23DCWKvPXV2waBW" } }
        }
      ) {
        aggregate {
          count
        }
      }
    }
  }
}

`)
