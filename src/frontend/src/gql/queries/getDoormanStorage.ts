export const DOORMAN_STORAGE_QUERY = `
  query DoormanStorageQuery($doormanContractAddress: String = "KT1C8skLrZqU6beWV3M1qD9TPBY8nnFpSPur") {
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
