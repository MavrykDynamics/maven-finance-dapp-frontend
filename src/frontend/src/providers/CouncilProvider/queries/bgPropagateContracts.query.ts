import { gql } from 'utils/__generated__'

export const PROPAGATE_BREAK_GLASS_CONTRACTS_QUERY = gql(`
	query propagateBgContractsQuery {
		governance {
			general_contracts {
				contract_address
			}
		}
	}
`)
