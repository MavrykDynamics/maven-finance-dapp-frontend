import gqlTag from 'graphql-tag'

/**
 * Bulk collateral lookup for a page of vaults.
 *
 * After GET_VAULTS_LIST_QUERY returns 10 vault IDs, fire this in
 * parallel to fetch all collateral balances in a single 310ms request.
 *
 * Nested through Hasura's lending_controller_vault.collateral_balances
 * relationship hits the same slow path as the view (~26s). The flat
 * `_in` lookup directly on the base table sidesteps that.
 */
export const GET_VAULTS_COLLATERAL_BULK_QUERY = gqlTag(`
  query getVaultsCollateralBulkQuery($vaultIds: [bigint!]!) {
    lending_controller_vault_collateral_balance(
      where: { lending_controller_vault_id: { _in: $vaultIds } }
    ) {
      id
      lending_controller_vault_id
      balance
      collateral_token {
        id
        token_name
        token {
          token_address
        }
      }
    }
  }
`)
