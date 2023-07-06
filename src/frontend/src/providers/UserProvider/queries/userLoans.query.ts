import { gql } from 'utils/__generated__/gql'

export const GET_USER_LOANS_DATA = gql(`
  subscription getUserLoansData($userAddress: String = "", $_in: [smallint!] = ["0", "1", "2", "3"]) {
    mavryk_user(where: { address: { _eq: $userAddress } }) {
      lending_controller_history_data_sender(
        where: { lending_controller: { mock_time: { _eq: false } }, type: { _in: $_in } }
        order_by: { type: asc, timestamp: asc }
      ) {
				id
        type
        timestamp
        operation_hash
        amount
        loan_token {
          token {
            token_address
          }
          current_interest_rate
        }
        lending_controller {
          interest_rate_decimals
          interest_treasury_share
          decimals
        }
      }

      lending_controller_vaults(where: { lending_controller: { mock_time: { _eq: false } } }) {
        collateral_balances {
          balance
          collateral_token {
            token {
              token_address
            }
          }
        }
        loan_decimals
        loan_principal_total
        loan_token {
          token {
            token_address
          }
        }
      }
    }
  }
`)
