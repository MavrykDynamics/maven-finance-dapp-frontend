import { VAULTS_DATA } from './../vaults.provider.consts'
import { DocumentNode } from 'graphql'
import { gql as apolloGql, OperationVariables, TypedDocumentNode } from '@apollo/client'

import { GetVaultsSubscriptionSubscription } from 'utils/__generated__/graphql'
import { VaultsSubsRecordType } from '../vaults.provider.types'

const VAULT_OPEN_FILTER = `open: {_eq: true}`

const getVaultsQueryFilters = (
  filters: VaultsSubsRecordType[typeof VAULTS_DATA],
  userAddress: string | null,
): string => {
  if (typeof filters === 'boolean') return VAULT_OPEN_FILTER

  switch (filters.subType) {
    case 'userAll':
      return `${VAULT_OPEN_FILTER} ${userAddress ? ', owner: {address: {_eq: $userAddress}}' : ''}`
    case 'userMarket':
      return `${VAULT_OPEN_FILTER} ${userAddress ? ', owner: {address: {_eq: $userAddress}}' : ''} ${
        filters.marketAddress ? ', loan_token: {token: {token_address: {_eq: $marketAddress}}' : ''
      }`
    case 'userPermissioned':
      return ``
    default:
      return VAULT_OPEN_FILTER
  }
}

export function getVaultsSubscription({
  userAddress,
  filters,
}: {
  userAddress: string | null
  filters: VaultsSubsRecordType[typeof VAULTS_DATA]
}): DocumentNode | TypedDocumentNode<GetVaultsSubscriptionSubscription, OperationVariables> {
  const vaultsFilters = getVaultsQueryFilters(filters, userAddress)

  return apolloGql(`
		subscription getVaultsSubscription($userAddress: String = "", $marketAddress: String = "") {
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
