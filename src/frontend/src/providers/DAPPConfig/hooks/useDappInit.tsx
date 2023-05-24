import { useEffect } from 'react'
import { useDAPPConfigContext } from '../dappConfig.provider'
import { useQuery } from '@apollo/client'
import { DIP_DUP_CONTRACTS_QUERY, GET_MAX_LENGTHS_QUERY, GET_MVK_FAUCET_QUERY } from 'gql/queries'

/**
 * @useDappInit loand data that is considered as needed across the whole DAPP
 *
 * @xtzBakers -> bakers off the xtz token
 * @mvkFaucetAddress -> faucet for MVK token
 * @maxLenghts -> max symbols amount per inputs, that is defined in indexer
 */
export const useDappInit = () => {
  const { updateMaxLengths, updateMVKFaucetAddress, updateXtzBakers, updateDipDupContracts, xtzBakers } =
    useDAPPConfigContext()

  // Load max lenghts for inputs
  const { data: maxLengthsData, loading: maxLengthsLoading } = useQuery(GET_MAX_LENGTHS_QUERY)

  useEffect(() => {
    if (!maxLengthsLoading && maxLengthsData) {
      updateMaxLengths(maxLengthsData)
    }
  }, [maxLengthsLoading])

  // Load MVK faucet
  const { data: mvkData, loading: mvkLoading } = useQuery(GET_MVK_FAUCET_QUERY)

  useEffect(() => {
    if (!mvkLoading && mvkData) {
      updateMVKFaucetAddress(mvkData)
    }
  }, [mvkLoading])

  // Load DipDUpContracts
  const { data: dipDupContracts, loading: dipDupContractsLoading } = useQuery(DIP_DUP_CONTRACTS_QUERY)

  useEffect(() => {
    if (!dipDupContractsLoading && dipDupContracts) {
      updateDipDupContracts(dipDupContracts)
    }
  }, [mvkLoading])

  // load bakers if they are not loaded
  // TODO: consider loading them when we need to use them
  useEffect(() => {
    if (!xtzBakers) {
      updateXtzBakers()
    }
  }, [xtzBakers])
}
