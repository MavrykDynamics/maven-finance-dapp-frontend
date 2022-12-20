export const LOANS_QUERY = `query GetLoanStorage {
  lending_controller(where: {mock_time: {_eq: true}}) {
    address
    admin
    admin_liquidation_fee_pct
    borrow_paused
    close_vault_paused
    add_liquidity_paused
    liquidate_vault_paused
    mark_for_liquidation_paused
    register_vault_creation_paused
    register_withdrawal_paused
    remove_liquidity_paused
    set_collateral_token_paused
    set_loan_token_paused
    vault_deposit_paused
    vault_deposit_smvk_paused
    vault_on_liquidate_paused
    vault_withdraw_paused
    vault_withdraw_smvk_paused
    register_deposit_paused
    repay_paused
    collateral_ratio
    decimals
    governance_id
    interest_rate_decimals
    interest_treasury_share
    last_updated_at
    liquidation_delay_in_minutes
    liquidation_fee_pct
    liquidation_ratio
    max_decimals_for_calculation
    max_vault_liquidation_pct
    minimum_loan_fee_pct
    minimum_loan_treasury_share
    mock_time
    loan_tokens {
      total_remaining
      utilisation_rate
      total_borrowed
      token_pool_total
      reserve_ratio
      oracle_id
      optimal_utilisation_rate
      min_repayment_amount
      max_interest_rate
      lp_token_address
      lp_token_total
      loan_token_name
      loan_token_address
      lending_controller_id
      last_updated_block_level
      interest_rate_below_optimal_utilisation
      interest_rate_above_optimal_utilisation
      id
      current_interest_rate
      borrow_index
      base_interest_rate
      accumulated_rewards_per_share
    }
  }
}`

export const LOANS_QUERY_NAME = 'ContractAddressesQuery'
export const LOANS_QUERY_VARIABLE = {}
