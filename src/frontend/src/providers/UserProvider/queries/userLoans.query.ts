import { gql } from 'utils/__generated__/gql'

export const GET_USER_LOANS_DATA = gql(`
  query getUserLoansData($userAddress: String = "", $_in: [smallint!] = ["0", "1", "2", "3"]) {
    maven_user: maven_user(where: { address: { _eq: $userAddress } }) {
      lending_controller_history_data_sender(
        where: { type: { _in: $_in } }
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
          utilisation_rate
        }
        lending_controller {
          interest_rate_decimals
          interest_treasury_share
          decimals
        }
      }

      lending_controller_vaults(where: { open: {_eq: true}}) {
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
        loan_interest_total
        loan_token {
          token {
            token_address
          }
        }
      }
    }
  }
`)
