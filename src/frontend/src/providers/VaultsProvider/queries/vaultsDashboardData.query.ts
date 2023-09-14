import { gql } from 'utils/__generated__'

export const GET_VAULTS_DASHBOARD_DATA = gql(`
	query dashboardVaultsTabData {
		lending_controller(where: {mock_time: {_eq: false}}) {
			allVaultsCollaterals: collateral_tokens {
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
			
			borrowedFromMarkets: loan_tokens {
				total_borrowed
				token {
					token_address
				}
			}
		}
	}
`)
