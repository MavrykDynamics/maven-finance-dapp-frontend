import { gql } from 'utils/__generated__'

export const CURRENT_USER_VAULTS_NAMES_QUERY = gql(`
	query getUserVaultsNamesQuery($userAddress: String) {
		lending_controller: lending_controller {
			vaults(where: {open: {_eq: true}, owner: {address: {_eq: $userAddress}}}) {
				vault {
					name
				}
			}
		}
	}
`)
