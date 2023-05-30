import { useEffect } from 'react'
import { useDAPPConfigContext } from '../dappConfig.provider'
import { useQuery } from '@apollo/client'
import { GET_MAX_LENGTHS_QUERY, GET_MVK_FAUCET_QUERY } from 'gql/queries'

/**
 * @useDappInit loand data that is considered as needed across the whole DAPP
 *
 * @xtzBakers -> bakers for the xtz token
 * @mvkFaucetAddress -> faucet for MVK token
 * @maxLenghts -> max symbols amount per inputs, that is defined in indexer
 * TODO: add loading mvk_faucet, when it's implemented on back-end
 */
export const useDappInit = () => {
  const { updateMaxLengths, updateMVKFaucetAddress, updateXtzBakers, xtzBakers } = useDAPPConfigContext()

  // Load max lenghts for inputs
  const { loading: maxLengthsLoading } = useQuery(GET_MAX_LENGTHS_QUERY, {
    onCompleted: (data) => {
      updateMaxLengths(data)
    },
    onError: (error) => {
      console.error('GET_MAX_LENGTHS_QUERY error: ', { error })
    },
  })

  // Load MVK faucet
  const { loading: mvkLoading } = useQuery(GET_MVK_FAUCET_QUERY, {
    onCompleted: (data) => {
      updateMVKFaucetAddress(data)
    },
    onError: (error) => {
      console.error('GET_MVK_FAUCET_QUERY error: ', { error })
    },
  })

  // load bakers if they are not loaded
  // TODO: consider loading them when we need to use them
  useEffect(() => {
    if (!xtzBakers) {
      updateXtzBakers()
    }
  }, [xtzBakers])

  return { isLoading: mvkLoading || maxLengthsLoading }
}
