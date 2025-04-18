// @ts-nocheck

import { gql } from 'utils/__generated__'

// get all vaults
// andrew_here replace this query with one I sent you

// example -> query getAllVaultsQuery($limit: Int, $offset: Int)
// see GET_USER_DEPOSITOR_ALL_VAULTS_QUERY how to pass variables on line 3 in this file
// when u update queries - DO NOT FORGET to run this command from console: <yarn graphql-compile>
// test queries in playground https://api.mavenfinance.io/console
export const GET_ALL_VAULTS_QUERY = gql(`
	query getAllVaultsQuery($vaultsWhere: gql_vault_with_balances_bool_exp, $vaultsOrderBy: [gql_vault_with_balances_order_by!], $limit: Int, $offset: Int) {
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
			order_by: $vaultsOrderBy, 
			where: $vaultsWhere,
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
	query GetVaultCounts($totalCountWhere: lending_controller_vault_bool_exp = {}, $userCountWhere: lending_controller_vault_bool_exp = {}, $permissionedCountWhere: lending_controller_vault_bool_exp = {}) {
  totalVaults: lending_controller {
    vaults_aggregate(where: $totalCountWhere) {
      aggregate {
        count
      }
    }
  }
  userOpenVaults: lending_controller {
    vaults_aggregate(where: $userCountWhere) {
      aggregate {
        count
      }
    }
  }
  otherOpenVaultsWithAllowance: lending_controller {
    vaults_aggregate(where: $permissionedCountWhere) {
      aggregate {
        count
      }
    }
  }
}
  `)
