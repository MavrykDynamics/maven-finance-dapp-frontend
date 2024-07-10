import { gql } from 'utils/__generated__'

export const GET_USER_DEPOSITOR_ALL_VAULTS_QUERY = gql(`
	query getUserDepositorAllVaultsQuery($userAddress: String) {
		lending_controller: lending_controller {
			max_vault_liquidation_pct
			decimals
			liquidation_fee_pct
			liquidation_ratio
			interest_rate_decimals
			admin_liquidation_fee_pct
			liquidation_delay_in_minutes

			vaults(order_by: {vault: {creation_timestamp: desc}}, where: {open: {_eq: true}, vault: {_or: [{allowance: {_eq: "0"}}, {_and: {depositors: {depositor: {address: {_eq: $userAddress}}}, allowance: {_eq: "1"}}}]}, owner: {address: {_neq: $userAddress}}}) {
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
				
				marked_for_liquidation_level
				liquidation_end_level
				loan_outstanding_total
				loan_principal_total
				internal_id
				borrow_index
			}
		}
	}
`)

export const GET_USER_ALL_VAULTS_QUERY = gql(`
	query getUserAllVaultsQuery($userAddress: String) {
		lending_controller: lending_controller {
			max_vault_liquidation_pct
			decimals
			liquidation_fee_pct
			liquidation_ratio
			interest_rate_decimals
			admin_liquidation_fee_pct
			liquidation_delay_in_minutes

			vaults(order_by: {vault: {creation_timestamp: desc}}, where: {open: {_eq: true}, owner: {address: {_eq: $userAddress}}}) {
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
				
				marked_for_liquidation_level
				liquidation_end_level
				loan_outstanding_total
				loan_principal_total
				internal_id
				borrow_index
			}
		}
	}
`)

// get all vaults
export const GET_ALL_VAULTS_QUERY = gql(`
	query getAllVaultsQuery {
		lending_controller: lending_controller {
			max_vault_liquidation_pct
			decimals
			liquidation_fee_pct
			liquidation_ratio
			interest_rate_decimals
			admin_liquidation_fee_pct
			liquidation_delay_in_minutes

			vaults(order_by: {vault: {creation_timestamp: desc}}, where: {open: {_eq: true}}) {
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
				
				marked_for_liquidation_level
				liquidation_end_level
				loan_outstanding_total
				loan_principal_total
				internal_id
				borrow_index
			}
		}
	}
`)
