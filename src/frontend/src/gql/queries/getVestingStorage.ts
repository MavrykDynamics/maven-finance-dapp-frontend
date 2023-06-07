export const VESTING_STORAGE_QUERY = `
  query GetVestingStorageQuery {
    vesting {
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
      }
    }
  }
`

export const VESTING_STORAGE_QUERY_NAME = 'GetVestingStorageQuery'
export const VESTING_STORAGE_QUERY_VARIABLE = {}
