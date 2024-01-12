import { gql } from 'utils/__generated__'

export const GET_DAPP_TVL = gql(`
	query DashboardTVL($doormanContractAddress: String = "") {
		doormanTVL: maven_user(where: {address: {_eq: $doormanContractAddress}}) {
			smvn_balance
			mvn_balance
		}

		lending_controller: lending_controller {
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

			collateralsForActiveVaults: collateral_tokens {
				token {
					token_address
				}
				balances_aggregate(where: {lending_controller_vault: {loan_outstanding_total: {_gt: 0}}}) {
					aggregate {
						sum {
							balance
						}
					}
				}
			}

			activeVaults: vaults_aggregate(where: {open: {_eq: true}}) {
				aggregate {
					count
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
