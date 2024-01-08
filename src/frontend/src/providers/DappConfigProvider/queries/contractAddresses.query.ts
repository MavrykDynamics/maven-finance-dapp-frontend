import { gql } from 'utils/__generated__'

export const GET_DAPP_CONTRACT_ADDRESSES = gql(`
	query getContractAddressesQuery {
		delegation: delegation {
			address
		}
		doorman: doorman {
			address
		}
		mvn_token: mvn_token {
			address
		}
		farm: farm {
			address
		}
		farm_factory: farm_factory {
			address
		}
		council: council {
			address
		}
		break_glass: break_glass {
			address
		}
		emergency_governance: emergency_governance {
			address
		}
		governance: governance {
			address
		}
		governance_proxy: governance_proxy {
			address
		}
		treasury: treasury {
			address
		}
		treasury_factory: treasury_factory {
			address
		}
		vesting: vesting {
			address
		}
		governance_satellite: governance_satellite {
			address
		}
		aggregator_factory: aggregator_factory {
			address
		}
		aggregator: aggregator {
			address
		}
		governance_financial: governance_financial {
			address
		}
		lending_controller: lending_controller {
			address
		}
		vault_factory: vault_factory {
			address
		}
	}
`)
