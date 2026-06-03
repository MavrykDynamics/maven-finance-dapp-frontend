import gqlTag from 'graphql-tag'

/**
 * Fetch the entire vault_depositor table.
 *
 * Production has 7 rows total — the previous architecture fetched
 * depositors_json per-row via the broken view, paying the full-scan
 * cost on every vault query. We now fetch this once with
 * staleTime: Infinity and filter client-side by vault_id.
 *
 * If this ever grows beyond a few thousand rows, switch to an _in
 * filter keyed off the visible vault page (same shape as
 * vaultsCollateral.query.ts).
 */
export const GET_VAULTS_DEPOSITORS_QUERY = gqlTag(`
  query getVaultsDepositorsQuery {
    vault_depositor {
      id
      vault_id
      depositor {
        id
        address
      }
    }
  }
`)
