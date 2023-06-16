import { gql } from 'utils/__generated__'

export const GET_MVK_FAUCET_QUERY = gql(`
query MVKFaucet {
  mvk_faucet{
    address
  }
}
`)
