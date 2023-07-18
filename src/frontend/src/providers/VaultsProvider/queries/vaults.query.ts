import { VAULTS_DATA, VAULTS_USER_ALL, VAULTS_USER_DEPOSITOR } from './../vaults.provider.consts'
import { DocumentNode } from 'graphql'
import { gql as apolloGql, OperationVariables, TypedDocumentNode } from '@apollo/client'

import { GetVaultsSubscriptionSubscription } from 'utils/__generated__/graphql'
import { VaultsSubsRecordType } from '../vaults.provider.types'
import { gql } from 'utils/__generated__'

const VAULT_OPEN_FILTER = `open: {_eq: true}`

// filter for user market specific vaults
// vaults(order_by: {vault: {creation_timestamp: desc}}, where: {open: {_eq: true}, owner: {address: {_eq: $userAddress}}, loan_token: {token: {token_address: {_eq: $marketAddress}}}})
const getUserVaultsQueryFilters = (
  filter: VaultsSubsRecordType[typeof VAULTS_DATA],
  userAddress: string | null,
): string => {
  if (userAddress) {
    // get all vaults where current user is owner
    if (filter === VAULTS_USER_ALL) {
      return `${VAULT_OPEN_FILTER} , owner: {address: {_eq: $userAddress}}`
    }

    // get all vaults where current user is depositor only, not owner
    if (filter === VAULTS_USER_DEPOSITOR) {
      return `${VAULT_OPEN_FILTER}, vault: {_or: [{allowance: {_eq: "0"}}, {_and: {depositors: {depositor: {address: {_eq: $userAddress}}}, allowance: {_eq: "1"}}}]}, owner: {address: {_neq: $userAddress}}`
    }
  }

  return `${VAULT_OPEN_FILTER}`
}

export function getUserVaultsSubscription({
  userAddress,
  filters,
}: {
  userAddress: string | null
  filters: VaultsSubsRecordType[typeof VAULTS_DATA]
}): DocumentNode | TypedDocumentNode<GetVaultsSubscriptionSubscription, OperationVariables> {
  const vaultsFilters = getUserVaultsQueryFilters(filters, userAddress)

  return apolloGql(`
		subscription getVaultsSubscription($userAddress: String) {
			lending_controller(where: {mock_time: {_eq: false}}) {
				max_vault_liquidation_pct
				decimals
				liquidation_fee_pct
				liquidation_ratio
				interest_rate_decimals
				admin_liquidation_fee_pct
				liquidation_delay_in_minutes

				vaults(order_by: {vault: {creation_timestamp: desc}}, where: {${vaultsFilters}}) {

					# collaterals of the vault
					collateral_balances {
						balance
						collateral_token {
							token {
								token_address
							}
						}
					}

					vault {
						creation_timestamp
						address
						name
						allowance
						baker {
							address
						}
						depositors {
							depositor {
								address
							}
						}
					}

					owner {
						address
					}
					
					marked_for_liquidation_level
					loan_outstanding_total
					loan_principal_total
					internal_id
					borrow_index

					loan_token {
						token {
							token_address
						}
						current_interest_rate
						borrow_index
						total_remaining
						token_pool_total
						reserve_ratio
						min_repayment_amount
					}
				}
			}
		}
`)
}

// get all vaults
export const SUBSCRIBE_TO_ALL_VAULTS = gql(`
	subscription getAllVaultsSubscription {
		lending_controller(where: {mock_time: {_eq: false}}) {
			max_vault_liquidation_pct
			decimals
			liquidation_fee_pct
			liquidation_ratio
			interest_rate_decimals
			admin_liquidation_fee_pct
			liquidation_delay_in_minutes

			vaults(order_by: {vault: {creation_timestamp: desc}}, where: {open: {_eq: true}}) {

				# collaterals of the vault
				collateral_balances {
					balance
					collateral_token {
						token {
							token_address
						}
					}
				}
			
				vault {
					creation_timestamp
					address
					name
					allowance
					baker {
						address
					}
					depositors {
						depositor {
							address
						}
					}
				}
			
				owner {
					address
				}
				
				marked_for_liquidation_level
				loan_outstanding_total
				loan_principal_total
				internal_id
				borrow_index
			
				loan_token {
					token {
						token_address
					}
					current_interest_rate
					borrow_index
					total_remaining
					token_pool_total
					reserve_ratio
					min_repayment_amount
				}
			}
		}
	}
`)
