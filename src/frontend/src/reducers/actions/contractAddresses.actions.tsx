import { AppDispatch } from 'app/App.controller'
import { normalizeAddressesStorage } from 'app/App.helpers'
import { fetchFromIndexerWithPromise } from 'gql/fetchGraphQL'
import { CONTRACT_ADDRESSES_QUERY, CONTRACT_ADDRESSES_QUERY_NAME, CONTRACT_ADDRESSES_QUERY_VARIABLE } from 'gql/queries'

export const GET_CONTRACT_ADDRESSES = 'GET_CONTRACT_ADDRESSES'

export const getContractAddressesStorage = () => async (dispatch: AppDispatch) => {
  try {
    const storage = await fetchFromIndexerWithPromise(
      CONTRACT_ADDRESSES_QUERY,
      CONTRACT_ADDRESSES_QUERY_NAME,
      CONTRACT_ADDRESSES_QUERY_VARIABLE,
    )
    const addressesStorage = normalizeAddressesStorage(storage)

    dispatch({ type: GET_CONTRACT_ADDRESSES, addresses: addressesStorage })
  } catch (e) {
    console.error('getDipDupTokensStorage error: ', e)
  }
}

export const SET_CONTRACT_ADDRESS = 'SET_CONTRACT_ADDRESS'
export const setContractAddress = (name: string, address: string) => async (dispatch: AppDispatch) => {
  const addressInfo = { [name]: { address } }
  dispatch({ type: SET_CONTRACT_ADDRESS, addressInfo })
}
