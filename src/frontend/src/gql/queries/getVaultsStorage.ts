export const VAULTS_STORAGE_QUERY = `
  query GetVaultsStorageQuery {
    vault {
      address
      admin
      allowance
      creation_timestamp
    }
  }
`

export const VAULTS_STORAGE_QUERY_NAME = 'GetVaultsStorageQuery'
export const VAULTS_STORAGE_QUERY_VARIABLE = {}
