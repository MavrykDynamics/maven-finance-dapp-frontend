import { sortVaultItems, SortVaultOption } from '../Vaults.consts'
import {
  Gql_Vault_With_Balances_Bool_Exp,
  Gql_Vault_With_Balances_Order_By,
  Lending_Controller_Vault_Bool_Exp,
  Order_By,
} from 'utils/__generated__/graphql'

export type Advanced_Gql_Vault_With_Balances_Bool_Exp = {
  where: Gql_Vault_With_Balances_Bool_Exp
  shadowWhere: Lending_Controller_Vault_Bool_Exp
}

// <where> (filter) -------------
export const getFilterCollateralQuery = (tokenAddress: string) => {
  const queryFilters: Advanced_Gql_Vault_With_Balances_Bool_Exp = {
    where: { collateral_json: { _has_key: tokenAddress } },
    shadowWhere: { loan_token: { token: { token_address: { _eq: tokenAddress } } } },
  }

  return queryFilters
}

// work for vaults all
export const getFilterBorrowedQuery = (loanTokenAddress: string) => {
  const queryFilters: Advanced_Gql_Vault_With_Balances_Bool_Exp = {
    where: { loan_token_address: { _eq: loanTokenAddress } },
    shadowWhere: { loan_token: { token: { token_address: { _eq: loanTokenAddress } } } },
  }

  return queryFilters
}

// <order_by> (sort) --------------
export const getVaultsOrderByQuery = (option: SortVaultOption): { orderBy?: Gql_Vault_With_Balances_Order_By } => {
  switch (option) {
    case sortVaultItems.COLLATERAL_HIGH:
      return { orderBy: { creation_timestamp: Order_By.Desc, total_collateral_usd_value: Order_By.Desc } }

    case sortVaultItems.COLLATERAL_LOW:
      return { orderBy: { creation_timestamp: Order_By.Desc, total_collateral_usd_value: Order_By.Asc } }

    case sortVaultItems.BORROWED_HIGH:
      return { orderBy: { creation_timestamp: Order_By.Desc, loan_principal_total: Order_By.Desc } }

    case sortVaultItems.BORROWED_LOW:
      return { orderBy: { creation_timestamp: Order_By.Desc, loan_principal_total: Order_By.Asc } }

    case sortVaultItems.STATUSES:
      return {
        orderBy: {
          creation_timestamp: Order_By.Desc,
          marked_for_liquidation_level: Order_By.Desc,
          is_open: Order_By.Desc,
          liquidation_end_level: Order_By.Desc,
        },
      }

    case sortVaultItems.MOST_RECENT:
    default:
      return {}
  }
}

// search query
export const getSearchQueryForWhereFilter = (searchValue: string): Advanced_Gql_Vault_With_Balances_Bool_Exp => {
  if (!searchValue) return { where: {}, shadowWhere: {} }
  return {
    where: {
      _or: [{ vault_name: { _ilike: searchValue } }, { vault_address: { _eq: searchValue } }],
    },
    shadowWhere: { vault: { _or: [{ name: { _eq: searchValue } }, { address: { _eq: searchValue } }] } },
  }
}

// zero vault loan balance
export const HIDE_VAULT_ZERO_BALANCES: Gql_Vault_With_Balances_Bool_Exp = { loan_outstanding_total: { _neq: '0' } }
