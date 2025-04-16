import { gql } from 'utils/__generated__'

export const USER_VAULT_BALANCES_QUERY = gql(`
    query getUserBalancesAggregate($userAddress: String, $loanTokenAddress: String) {
  gql_vault_with_balances_aggregate(where: {owner_address: {_eq: $userAddress}, is_open: {_eq: true}, loan_token_address: {_eq: $loanTokenAddress}}) {
    aggregate {
      sum {
        token_pool_total
        loan_interest_total
        loan_outstanding_total
        total_remaining
      }
    }
  }
}`)
