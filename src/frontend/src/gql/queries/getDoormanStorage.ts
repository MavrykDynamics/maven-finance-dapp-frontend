export const DOORMAN_STORAGE_QUERY = `
  query DoormanStorageQuery {
    doorman {
      stake_accounts_aggregate {
        aggregate {
          sum {
            smvk_balance
          }
        }
      }
    }

    mvk_token {
      total_supply
      maximum_supply
    }
  }
`

export const DOORMAN_STORAGE_QUERY_NAME = 'DoormanStorageQuery'
export const DOORMAN_STORAGE_QUERY_VARIABLE = {}

export const SMVK_HISTORY_DATA_QUERY = `
  query GetSmvkHistoryData {
    smvk_history_data {
      smvk_total_supply
      timestamp
    }
  }
`

export const SMVK_HISTORY_DATA_QUERY_NAME = 'GetSmvkHistoryData'
export const SMVK_HISTORY_DATA_QUERY_VARIABLE = {}

export const MVK_MINT_HISTORY_DATA_QUERY = `
  query GetMvkMintData {
    mvk_mint_history_data {
      mvk_total_supply
      minted_amount
      timestamp
    }
  }
`
export const MVK_MINT_HISTORY_DATA_QUERY_NAME = 'GetMvkMintData'
export const MVK_MINT_HISTORY_DATA_QUERY_VARIABLE = {}
