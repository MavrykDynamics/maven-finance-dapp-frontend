import { DocumentNode } from 'graphql'

import { gql as apolloGql, OperationVariables, TypedDocumentNode } from '@apollo/client'
import { gql } from 'utils/__generated__'

import { GetLoansMarketsSubscriptionSubscription } from 'utils/__generated__/graphql'

export function getVaultsSubscription({
  marketTokenAddress,
}: {
  marketTokenAddress: string | null
}): DocumentNode | TypedDocumentNode<GetLoansMarketsSubscriptionSubscription, OperationVariables> {
  const filterByAddress = `token: {token_address: {${marketTokenAddress ? '_eq' : '_neq'}: $marketTokenAddress}}`

  return apolloGql(`
    subscription getLoansMarketsSubscription($marketTokenAddress: String = "") {
      lending_controller(where: {mock_time: {_eq: false}}) {
				collateral_ratio
				interest_treasury_share
				interest_rate_decimals
				decimals

				loan_tokens(where: {${filterByAddress}}) {
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
						accounts_aggregate(where: {balance: {_gte: 0}}) {
							aggregate {
								count
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
}
