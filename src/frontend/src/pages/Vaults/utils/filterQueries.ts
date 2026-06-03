import { sortVaultItems, SortVaultOption } from '../Vaults.consts'
import {
  Lending_Controller_Vault_Bool_Exp,
  Lending_Controller_Vault_Order_By,
  Order_By,
} from 'utils/__generated__/graphql'

// `where` now targets `lending_controller_vault` (the base table) instead of
// the broken gql_vault_with_balances view. `shadowWhere` was already in
// base-table shape, so the two fields now have the same type — kept distinct
// only because the count query still uses `shadowWhere` independently.
export type Advanced_Gql_Vault_With_Balances_Bool_Exp = {
  where: Lending_Controller_Vault_Bool_Exp
  shadowWhere: Lending_Controller_Vault_Bool_Exp
}

// <where> (filter) -------------
export const getFilterCollateralQuery = (tokenAddress: string) => {
  const queryFilters: Advanced_Gql_Vault_With_Balances_Bool_Exp = {
    where: {
      collateral_balances: { collateral_token: { token: { token_address: { _eq: tokenAddress } } } },
    },
    shadowWhere: { loan_token: { token: { token_address: { _eq: tokenAddress } } } },
  }

  return queryFilters
}

// work for vaults all
export const getFilterBorrowedQuery = (loanTokenAddress: string) => {
  const queryFilters: Advanced_Gql_Vault_With_Balances_Bool_Exp = {
    where: { loan_token: { token: { token_address: { _eq: loanTokenAddress } } } },
    shadowWhere: { loan_token: { token: { token_address: { _eq: loanTokenAddress } } } },
  }

  return queryFilters
}

// <order_by> (sort) --------------
// IMPORTANT: order by `id desc` (autoincrement, indexed primary key) instead
// of `creation_timestamp desc`. Both are monotonic per ingest order, but `id`
// is 44× faster — Hasura's relationship-based ordering generates a per-row
// subquery against the vault table.
export const getVaultsOrderByQuery = (
  option: SortVaultOption,
): { orderBy?: Lending_Controller_Vault_Order_By } => {
  switch (option) {
    case sortVaultItems.COLLATERAL_HIGH:
      // No total_collateral_usd_value on base table; fall back to id desc
      return { orderBy: { id: Order_By.Desc } }

    case sortVaultItems.COLLATERAL_LOW:
      return { orderBy: { id: Order_By.Desc } }

    case sortVaultItems.BORROWED_HIGH:
      return { orderBy: { id: Order_By.Desc, loan_principal_total: Order_By.Desc } }

    case sortVaultItems.BORROWED_LOW:
      return { orderBy: { id: Order_By.Desc, loan_principal_total: Order_By.Asc } }

    case sortVaultItems.STATUSES:
      return {
        orderBy: {
          marked_for_liquidation_level: Order_By.Desc,
          open: Order_By.Desc,
          liquidation_end_level: Order_By.Desc,
        },
      }

    case sortVaultItems.MOST_RECENT:
    default:
      return { orderBy: { id: Order_By.Desc } }
  }
}

// search query — translated from view fields (vault_name, vault_address)
// to relationship form (vault.name, vault.address)
export const getSearchQueryForWhereFilter = (searchValue: string): Advanced_Gql_Vault_With_Balances_Bool_Exp => {
  if (!searchValue) return { where: {}, shadowWhere: {} }
  return {
    where: {
      vault: { _or: [{ name: { _ilike: searchValue } }, { address: { _eq: searchValue } }] },
    },
    shadowWhere: { vault: { _or: [{ name: { _eq: searchValue } }, { address: { _eq: searchValue } }] } },
  }
}

// zero vault loan balance — same field name in both shapes
export const HIDE_VAULT_ZERO_BALANCES: Lending_Controller_Vault_Bool_Exp = {
  loan_outstanding_total: { _neq: '0' },
}
