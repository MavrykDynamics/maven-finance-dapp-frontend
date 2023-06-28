import { gql } from 'utils/__generated__/gql'

export const SUBSCRIBE_USER_DATA = gql(`
subscription getUserData($userAddress: String = "") {
	mavryk_user(where: {address: {_eq: $userAddress}}) {
  	address
    
    delegations {
      satellite {
        user {
          address
        }
      }
    }

		stakes_history_data(where: {type: {_in: ["0", "1", "2", "3", "4"]}}) {
      type
      id
      desired_amount
      final_amount
      from_ {
        mvk_balance
        smvk_balance
      }
    }

		# user's images
		# is user active satellite
		satellites {
			currently_registered
			status
      user {
				address
			}
			image
    }
    council_council_members{
      image
    }
    break_glass_council_members {
      image
    }

		
    
		# is user active vestee
    vesting_vestees {
      end_vesting_timestamp
    }
	}
}
`)
