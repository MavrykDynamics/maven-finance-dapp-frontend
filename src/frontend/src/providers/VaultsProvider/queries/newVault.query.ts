import { gql } from 'utils/__generated__'

export const GET_NEW_VAULT = gql(`
query GetUsersLastestCreatedVault($userAddress: String = "", $vaultName: String = "") {
  vault(where: {name: {_eq: $vaultName}, _and: {lending_controller_vaults: {owner: {address: {_eq: $userAddress}}}}}) {
    name
    address
    creation_timestamp
    name
    address
    id
  }
}

`)
