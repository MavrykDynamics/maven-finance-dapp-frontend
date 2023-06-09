import { gql } from 'utils/__generated__'

// Cals 24h diffs
export const LENDING_24H_OPERATIONS_QUERY = gql(`
query getLendingDiff($currentTimestamp: timestamptz) {
  lending_controller(where: {mock_time: {_eq: false}}) {
    history_data(where: {type: {_in: ["0", "1"]}, timestamp: {_gte: $currentTimestamp}}, distinct_on: timestamp, order_by: {timestamp: asc}) {
      type
      amount
      timestamp
      loan_token {
        token {
          token_address
        }
      }
    }
  }
}
`)

export const BORROWING_24H_OPERATIONS_QUERY = gql(`
query getBorrowingDiff($currentTimestamp: timestamptz) {
  lending_controller(where: {mock_time: {_eq: false}}) {
    history_data(where: {type: {_in: ["2", "3", "4", "5", "6", "7"]}, timestamp: {_gte: $currentTimestamp}}, distinct_on: timestamp, order_by: {timestamp: asc}) {
      type
      amount
      timestamp
      loan_token {
        token {
          token_address
        }
      }
    }
  }
}
`)

export const GET_CURRENT_LOANS_TOTAL_LEND_BORROW = gql(`
query getCurrentLendBorrow {
  lending_controller(where: {mock_time: {_eq: false}}) {
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
