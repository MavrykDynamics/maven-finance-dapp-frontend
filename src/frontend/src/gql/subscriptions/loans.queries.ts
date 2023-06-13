import { gql } from 'utils/__generated__'

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

// Loans market transaction history
export const GET_LOANS_HISTORY_FOR_MARKET_DATA = gql(`
subscription getLoansHistoryForMarketData($marketTokenAddress: String) {
  lending_controller(where: {mock_time: {_eq: false}}) {
    history_data(where: {type: {_in: ["0", "1", "2", "3", "4", "5", "6", "7"]}, loan_token: {token: {token_address: {_eq: $marketTokenAddress}}}}, distinct_on: timestamp, order_by: {timestamp: asc}) {
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
