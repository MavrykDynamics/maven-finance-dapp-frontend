import { gql } from 'utils/__generated__'

export const SUBSCRIBE_USER_VAULTS_NAMES = gql(`
		subscription getUserVaultsNamesSubscription($userAddress: String = "tz1Y2tUUooW6QT6pQCeqz9ep9wCkX5bnKeTs") {
			lending_controller(where: {mock_time: {_eq: false}}) {
				vaults(order_by: {vault: {creation_timestamp: desc}}, where: {open: {_eq: true}, owner: {address: {_eq: $userAddress}}}) {
					vault {
						name
					}
				}
			}
		}
`)
