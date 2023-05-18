import { useEffect, useState } from 'react'
import { useQuery } from '@apollo/client'

// providers
import { useDAPPConfigContext } from 'providers/DAPPConfig/dappConfig.provider'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useDataFeedsContext } from 'providers/DataFeedsProvider/dataFeeds.provider'

// queries
import { GET_MAX_LENGTHS_QUERY } from 'gql/queries/getMaxLengthsData'
import {
  GET_GOVERNANCE_CONTRACT_ADDRESS_QUERY,
  GET_DAPP_TOKENS_QUERY,
  GET_MVK_FAUCET_QUERY,
} from 'gql/queries/getTokensData'
import { GET_ORACLE_STORAGE_QUERY } from 'gql/queries/getOracleStorage'
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'

type InternalState = {
  tokensAddress: string | null
}

export const useInitializer = () => {
  const [state, setState] = useState<InternalState>({ tokensAddress: null })

  const { initializeDappConfigData } = useDAPPConfigContext()
  const { initializeDAPPTokens, updateMVKFaucetAddress, selfUpdateXtzBakers } = useTokensContext()
  const { initializeDataFeeds } = useDataFeedsContext()

  // dapp max lengths
  const { data: maxLengthsData, loading: maxLengthsLoading } = useQuery(GET_MAX_LENGTHS_QUERY)

  // tokens
  const { data: contractsData, loading: contractsLoading } = useQuery(GET_GOVERNANCE_CONTRACT_ADDRESS_QUERY, {
    onCompleted(data) {
      const address = data?.governance?.[0]?.general_contracts?.[0]?.contract_address

      if (!address) {
        // TODO add toast
        throw new Error('No active governance contract')
      }

      setState({ ...state, tokensAddress: address })
    },
  })

  const { data: dappTokensData, loading: dappTokensLoading } = useQuery(GET_DAPP_TOKENS_QUERY, {
    skip: !Boolean(state.tokensAddress),
    variables: {
      _whitelistTokensAddress: state.tokensAddress,
    },
  })

  const { data: mvkData, loading: mvkLoading } = useQuery(GET_MVK_FAUCET_QUERY)

  // data feeds
  const { data: feedsData, loading: feedsLoading } = useQuery(GET_ORACLE_STORAGE_QUERY)

  // for tokens
  const { isLoading } = useDataLoader(async () => {
    try {
      await selfUpdateXtzBakers()
    } catch (error) {
      console.error(error)
    }
  }, [])

  // maxLengths init
  useEffect(() => {
    if (!maxLengthsLoading && maxLengthsData) {
      initializeDappConfigData(maxLengthsData)
    }
  }, [maxLengthsLoading])

  // tokens init
  useEffect(() => {
    if (!contractsLoading && !dappTokensLoading && !isLoading && contractsData && dappTokensData) {
      initializeDAPPTokens(dappTokensData)
    }
  }, [contractsLoading, dappTokensLoading, isLoading])

  useEffect(() => {
    if (!mvkLoading && mvkData) {
      updateMVKFaucetAddress(mvkData)
    }
  }, [mvkLoading])

  // data feeds init
  useEffect(() => {
    if (!feedsLoading && feedsData) {
      initializeDataFeeds(feedsData)
    }
  }, [feedsLoading])
}
