import { gql } from 'utils/__generated__'
import { gql as apolloGql } from '@apollo/client'
import { OperationVariables, TypedDocumentNode } from '@apollo/client'
import { DocumentNode } from 'graphql'
import { GetLoansHistoryForMarketDataSubscription } from 'utils/__generated__/graphql'

// update every block lvl + convert it to query
// Cals 24h diffs
export const LEND_BORROW_24H_DIFF = gql(`
subscription getLendingDiff($currentTimestamp: timestamptz) {
  lending_controller(where: {mock_time: {_eq: false}}) {
    history_data(where: {type: {_in: ["0", "1", "2", "3", "4", "5", "6", "7"]}, timestamp: {_gte: $currentTimestamp}}, distinct_on: timestamp, order_by: {timestamp: asc}) {
      type
      amount
      timestamp
      loan_token {
        token {
          token_address
        }
      }
    }
  
    loan_tokens {
      total_borrowed
      token_pool_total
      token {
        token_address
      }
    }
  }
}
`)

// add pagination for last period that is shown on chart, update every block lvl
// Loans history data
export const GET_LOANS_HISTORY_DATA = gql(`
subscription getLoansHistoryData {
  lending_controller(where: {mock_time: {_eq: false}}) {
    history_data(where: {type: {_in: ["0", "1", "2", "3", "4", "5", "6", "7"]}}, distinct_on: timestamp, order_by: {timestamp: asc}) {
      type
      amount
      timestamp
      loan_token {
        loan_token_name
        token {
          token_address
        }
      }
      collateral_token {
        token {
          token_address
        }
      }
    }
  }
}
`)

// pagination + update every block lvl + convert it to query
// Loans market transaction history
export function getLoansHistorySubscription({
  userAddress,
  vaultAddress,
  typeFilter,
}: {
  userAddress?: string
  vaultAddress?: string
  typeFilter?: Array<number>
}): DocumentNode | TypedDocumentNode<GetLoansHistoryForMarketDataSubscription, OperationVariables> {
  const filterUserCondition = userAddress ? `sender: {address: {_eq: $userAddress}}` : `sender: {address: {_neq: ""}}`
  const filterVaultCondition = vaultAddress ? `vault: { vault: {address: {_eq: $vaultAddress}}}` : ''
  const filterTypeCondition = typeFilter
    ? `type: {_in: $typeFilter}`
    : `type: {_in: ["0", "1", "2", "3", "4", "5", "6", "7"]}`

  return apolloGql(`
    subscription getLoansHistoryForMarketData($marketTokenAddress: String, $userAddress: String = "", $vaultAddress: String = "", $typeFilter: [smallint] = []) {
      lending_controller(where: {mock_time: {_eq: false}}) {
        history_data(where: {${filterTypeCondition}, loan_token: {token: {token_address: {_eq: $marketTokenAddress}}}, ${filterUserCondition}, ${filterVaultCondition}}, distinct_on: timestamp, order_by: {timestamp: desc}) {
          type
          amount
          timestamp
          loan_token {
            loan_token_name
            token {
              token_address
            }
          }
          collateral_token {
            token {
              token_address
              mvk_tokens {
                address
              }
            }
          }
          operation_hash
          sender {
            address
          }
          vault {
            vault {
              address
            }
          }
        }
      }
    }
`)
}
