import { gql } from 'utils/__generated__'

export const GET_MARKET_BY_ADDRESS_QUERY = gql(`
	query loansMarketByAddressQuery($marketTokenAddress: String = "") {
		allMarketsAddresses: lending_controller {
			loan_tokens {
				token {
					token_address
				}
			}
		}

		lending_controller: lending_controller {
			collateral_ratio
			interest_treasury_share
			interest_rate_decimals
			decimals

			loan_tokens(where: {token: {token_address: {_eq: $marketTokenAddress}}}){
				token {
					token_address
				}

				loan_token_name
				id
				utilisation_rate
				total_borrowed
				token_pool_total
				total_remaining
				reserve_ratio
				current_interest_rate

				# market lending item address, and amount of suppliers
				m_token {
					address
					depositorsAmount: accounts_aggregate(where: {balance: {_gte: 0}}) {
						aggregate {
							count
						}
					}
					mTokenRewardsAmount: accounts_aggregate {
						aggregate {
							sum {
								rewards_earned
							}
						}
					}
				}

				# number of borrowers
				vaults_aggregate(where: {loan_outstanding_total: {_neq: "0"}}) {
					aggregate {
						count(distinct: true, columns: owner_id)
					}
				}
			}
		}
	}
`)

export const GET_ALL_MARKETS_QUERY = gql(`
	query allLoansMarketsQuery {
		lending_controller: lending_controller {
			collateral_ratio
			interest_treasury_share
			interest_rate_decimals
			decimals

			loan_tokens{
				token {
					token_address
				}

				loan_token_name
				id
				utilisation_rate
				total_borrowed
				token_pool_total
				total_remaining
				reserve_ratio
				current_interest_rate

				# market lending item address, and amount of suppliers
				m_token {
					address
					depositorsAmount: accounts_aggregate(where: {balance: {_gte: 0}}) {
						aggregate {
							count
						}
					}
					mTokenRewardsAmount: accounts_aggregate {
						aggregate {
							sum {
								rewards_earned
							}
						}
					}
				}

				# number of borrowers
				vaults_aggregate(where: {loan_outstanding_total: {_neq: "0"}}) {
					aggregate {
						count(distinct: true, columns: owner_id)
					}
				}
			}
		}
	}
`)

export const GET_LOANS_CONFIG = gql(`
	query getLoansConfig($currentTimestamp: timestamptz) {
		lending_controller: lending_controller {
			minimum_loan_fee_pct
			collateral_ratio
		}
	}
`)

export const CHECK_WHETHER_MARKET_EXISTS = gql(`
	query checkWitherMarketExists($marketAddress: String = "") {
		lending_controller: lending_controller {
			loan_tokens(where: {token: {token_address: {_eq: $marketAddress}}}) {
				token {
					token_address
				}
			}
		}
	}
`)
