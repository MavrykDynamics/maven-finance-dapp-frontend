import { gql } from 'utils/__generated__'

export const GET_USER_DEPOSITOR_ALL_VAULTS_QUERY = gql(`
	query getUserDepositorAllVaultsQuery($userAddress: String) {
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
			order_by: {vault_name: desc}, 
			where: {
				is_open: {_eq: true},
				owner_address: {_neq: $userAddress},
				_or: [
					{allowance: {_eq: 0}},
					{_and: [
						{depositors_json: {_contains: {address: $userAddress}}},
						{allowance: {_eq: 1}}
					]}
				]
			}
		) {
			vault_address
			vault_name
			vault_id
			owner_address
			loan_token_address
			loan_outstanding_total
			loan_principal_total
			loan_interest_total
			collateral_json
			is_open
			current_interest_rate
			borrow_index
			total_remaining
			token_pool_total
			reserve_ratio
			min_repayment_amount
			allowance
		}
	}
`)

export const GET_USER_ALL_VAULTS_QUERY = gql(`
	query getUserAllVaultsQuery($userAddress: String) {
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
			order_by: {vault_name: desc}, 
			where: {
				is_open: {_eq: true},
				owner_address: {_eq: $userAddress}
			}
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
		}
	}
`)

// get all vaults
export const GET_ALL_VAULTS_QUERY = gql(`
	query getAllVaultsQuery {
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
			order_by: {vault_name: desc}, 
			where: {is_open: {_eq: true}}
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
		}
	}
`)
