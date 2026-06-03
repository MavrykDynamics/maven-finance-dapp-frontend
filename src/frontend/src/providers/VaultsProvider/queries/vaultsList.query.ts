import gqlTag from 'graphql-tag'

/**
 * Fast vault list query — base tables only, no broken view.
 *
 * Replaces GET_ALL_VAULTS_QUERY which queried gql_vault_with_balances.
 * That view inherits a `row_number() OVER ()` full-scan from
 * vault_collateral_view, making even single-row reads take ~3s.
 *
 * Two key changes that take cold load from 18s → 336ms:
 *   1. Query lending_controller_vault directly via Hasura relationships,
 *      not the view.
 *   2. Order by lending_controller_vault.id desc (autoincrement,
 *      indexed). Equivalent to creation_timestamp desc semantically,
 *      but 44× faster — Hasura's relationship-based order_by generates
 *      a per-row subquery against the vault table.
 *
 * Collateral data lives in a separate parallel query (see
 * vaultsCollateral.query.ts) to avoid Hasura's nested-relationship
 * translation hitting the same disease as the view.
 */
export const GET_VAULTS_LIST_QUERY = gqlTag(`
  query getVaultsListQuery(
    $where: lending_controller_vault_bool_exp,
    $orderBy: [lending_controller_vault_order_by!],
    $limit: Int,
    $offset: Int
  ) {
    lending_controller: lending_controller {
      max_vault_liquidation_pct
      decimals
      liquidation_fee_pct
      liquidation_ratio
      interest_rate_decimals
      admin_liquidation_fee_pct
      liquidation_delay_in_minutes
    }

    vaults: lending_controller_vault(
      where: $where
      order_by: $orderBy
      limit: $limit
      offset: $offset
    ) {
      id
      internal_id
      open
      loan_outstanding_total
      loan_principal_total
      loan_interest_total
      last_updated_block_level
      marked_for_liquidation_level
      liquidation_end_level
      borrow_index
      vault {
        id
        address
        name
        creation_timestamp
        allowance
        baker {
          address
        }
      }
      owner {
        address
      }
      loan_token {
        id
        loan_token_name
        current_interest_rate
        borrow_index
        total_remaining
        token_pool_total
        reserve_ratio
        min_repayment_amount
        token {
          token_address
        }
      }
    }
  }
`)
