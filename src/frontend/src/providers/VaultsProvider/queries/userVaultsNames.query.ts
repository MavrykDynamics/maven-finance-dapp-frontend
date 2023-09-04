import { gql } from 'utils/__generated__'

export const CURRENT_USER_VAULTS_NAMES_QUERY = gql(`
	query getUserVaultsNamesQuery($userAddress: String) {
		lending_controller: lending_controller(where: {mock_time: {_eq: false}}) {
			vaults(order_by: {vault: {creation_timestamp: desc}}, where: {open: {_eq: true}, owner: {address: {_eq: $userAddress}}}) {
				vault {
					name
				}
			}
		}
	}
`)
