export const NEW_VAULT_QUERY = `
  query GetUsersLastestCreatedVault($userAddress: String = "", $vaultName: String = "") {
    vault(order_by: {creation_timestamp: desc}, limit: 1, where: {name: {_eq: $vaultName}}) {
      creation_timestamp
      name
      lending_controller_vaults(order_by: {last_updated_timestamp: asc}, where: {owner: {address: {_eq: $userAddress}}, lending_controller: {mock_time: {_eq: false}}}) {
        last_updated_timestamp
        vault {
          address
        }
      }
    }
  }
`

export const NEW_VAULT_QUERY_NAME = 'GetUsersLastestCreatedVault'
export const NEW_VAULT_QUERY_VARIABLE = (userAddress: string, vaultName: string) => ({ userAddress, vaultName })
