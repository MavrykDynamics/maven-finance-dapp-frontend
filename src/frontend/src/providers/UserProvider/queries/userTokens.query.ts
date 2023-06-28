import { gql } from 'utils/__generated__/gql'

export const SUBSCRIBE_USER_MVK_SMVK_BALANCE = gql(`
subscription getUserMvkSmvkBalance($userAddress: String = "") {
	mavryk_user(where: {address: {_eq: $userAddress}}) {
  	smvk_balance
    mvk_balance

		# TODO: check how to get address, usage of mvk_transfer_sender & mvk_transfer_receiver is temp
    mvk_transfer_sender(limit: 1) {
      mvk_token {
        address
      }
    }
    mvk_transfer_receiver(limit: 1) {
      mvk_token {
        address
      }
    }

		# Getting user mToken balances
		m_token_accounts {
      balance
      m_token {
        address
      }
    }
	}
}
`)
