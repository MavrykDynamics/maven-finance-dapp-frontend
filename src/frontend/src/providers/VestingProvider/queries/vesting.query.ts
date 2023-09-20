import { gql } from 'utils/__generated__'

export const GET_VESTING_STORAGE_QUERY = gql(`
  query getVestingQuery {
    vesting: vesting {
      address
      admin
      governance_id
      total_vested_amount
      
      vestees_aggregate {
        aggregate {
          sum {
            total_claimed
            total_remainder
          }
        }
      }

      vestees {
        locked

        vestee {
          address
        }

        total_remainder
        total_allocated_amount
        claim_amount_per_month
        cliff_months
        vesting_months
        next_redemption_timestamp
        last_claimed_timestamp
        end_cliff_timestamp
      }
    }
  }
`)
