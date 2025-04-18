// MOST RECENT
// { creation_timestamp: desc }

import { LendingQueryFilterType } from 'providers/VaultsProvider/vaults.provider.types'

// STATUS
//   order_by: [
// 	{ marked_for_liquidation_level: desc },
// 	{ liquidation_end_level: desc },
// 	{ is_open: desc },
// 	{ creation_timestamp: desc }
//   ]

// BORROWED AMOUNT ASC / DESC
// { creation_timestamp: desc }
// {loan_principal_total: asc}

// Collateral JSON same asc / desc

export const getFilterCollateralQuery = (tokenAddress: string) => {
  const queryFilters: Partial<LendingQueryFilterType> = {
    where: { collateral_json: { _has_key: tokenAddress } },
  }

  return queryFilters
}

export const getFilterBorrowedQuery = (loanTokenAddress: string) => {
  const queryFilters: Partial<LendingQueryFilterType> = {
    where: { loan_token_address: { _eq: loanTokenAddress } },
  }

  return queryFilters
}
