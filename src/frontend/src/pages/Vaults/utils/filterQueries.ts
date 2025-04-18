import { sortVaultItems, SortVaultOption } from '../Vaults.consts'
import {
  Gql_Vault_With_Balances_Bool_Exp,
  Gql_Vault_With_Balances_Order_By,
  Order_By,
} from 'utils/__generated__/graphql'

// <where> (filter) -------------
export const getFilterCollateralQuery = (tokenAddress: string) => {
  const queryFilters: { where: Gql_Vault_With_Balances_Bool_Exp } = {
    where: { collateral_json: { _has_key: tokenAddress } },
  }

  return queryFilters
}

// workd for vaults all
export const getFilterBorrowedQuery = (loanTokenAddress: string) => {
  const queryFilters: { where: Gql_Vault_With_Balances_Bool_Exp } = {
    where: { loan_token_address: { _eq: loanTokenAddress } },
  }

  return queryFilters
}

// <order_by> (sort) --------------
export const getVaultsOrderByQuery = (option: SortVaultOption): { orderBy?: Gql_Vault_With_Balances_Order_By } => {
  switch (option) {
    case sortVaultItems.COLLATERAL_HIGH:
      return { orderBy: { creation_timestamp: Order_By.Desc, collateral_json: Order_By.Desc } }

    case sortVaultItems.COLLATERAL_LOW:
      return { orderBy: { creation_timestamp: Order_By.Desc, collateral_json: Order_By.Asc } }

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
