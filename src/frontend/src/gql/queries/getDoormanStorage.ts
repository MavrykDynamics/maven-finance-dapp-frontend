export const DOORMAN_STORAGE_QUERY = `
  query DoormanStorageQuery($doormanContractAddress: String = "") {
    mvk_token {
      total_supply
      maximum_supply
    }

    mavryk_user(where: {address: {_eq: $doormanContractAddress}}) {
      mvk_balance
    }
  }
`

export const DOORMAN_STORAGE_QUERY_NAME = 'DoormanStorageQuery'

export function DOORMAN_STORAGE_QUERY_VARIABLE(address: string) {
  return { doormanContractAddress: address }
}

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

export const MVK_HISTORY_DATA_QUERY = `
  query GetMvkData {
    mvk_token {
      transfer_history_data {
        amount
        timestamp
      }
    }
  }
`
export const MVK_HISTORY_DATA_QUERY_NAME = 'GetMvkData'
export const MVK_HISTORY_DATA_QUERY_VARIABLE = {}
