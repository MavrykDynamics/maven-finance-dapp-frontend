import { gql } from 'utils/__generated__'

export const GET_DAPP_TVL = gql(`
	query DashboardTVL($doormanContractAddress: String = "KT1MibkhXKqAURGy6kx9brGk2U8Y8Ysr4niN") {
		doormanTVL: mavryk_user(where: {address: {_eq: $doormanContractAddress}}) {
			smvk_balance
			mvk_balance
		}
		lending_controller(where: {mock_time: {_eq: false}}) {
			vaultsLvl: collateral_tokens {
				token {
					token_address
				}
				balances_aggregate {
					aggregate {
						sum {
							balance
						}
					}
				}
			}
			
			marketsTvl: loan_tokens {
				total_borrowed
				total_remaining
				token {
					token_address
				}
			}
		}
		treasuryTvl: treasury_balance {
			balance
			token {
				token_address
			}
		}
	}
`)
