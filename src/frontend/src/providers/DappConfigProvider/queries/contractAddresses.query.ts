import { gql } from 'utils/__generated__'

export const GET_DAPP_CONTRACT_ADDRESSES = gql(`
	query getContractAddressesQuery {
		delegation {
			address
		}
		doorman {
			address
		}
		mvk_token {
			address
		}
		farm {
			address
		}
		farm_factory {
			address
		}
		council {
			address
		}
		break_glass {
			address
		}
		emergency_governance {
			address
		}
		governance {
			address
		}
		governance_proxy {
			address
		}
		treasury {
			address
		}
		treasury_factory {
			address
		}
		vesting {
			address
		}
		governance_satellite {
			address
		}
		aggregator_factory {
			address
		}
		aggregator {
			address
		}
		governance_financial {
			address
		}
		lending_controller(where: {mock_time: {_eq: false}}) {
			address
		}
		vault_factory {
			address
		}
	}
`)
