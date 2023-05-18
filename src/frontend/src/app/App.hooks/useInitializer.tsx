import { useEffect, useState } from 'react'
import { useQuery } from '@apollo/client'

// providers
import { useDAPPConfigContext } from 'providers/DAPPConfig/dappConfig.provider'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'

// queries
import { GET_MAX_LENGTHS_QUERY } from 'gql/queries/getMaxLengthsData'
import {
  GET_GOVERNANCE_CONTRACT_ADDRESS_QUERY,
  GET_DAPP_TOKENS_QUERY,
  GET_MVK_FAUCET_QUERY,
} from 'gql/queries/getTokensData'

type InternalState = {
  tokensAddress: string | null
}

export const useInitializer = () => {
  const [state, setState] = useState<InternalState>({ tokensAddress: null })

  const { initializeDappConfigData } = useDAPPConfigContext()
  const { initializeDAPPTokens, updateMVKFaucetAddress } = useTokensContext()

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

  useEffect(() => {
    if (!maxLengthsLoading && maxLengthsData) {
      initializeDappConfigData(maxLengthsData)
    }
  }, [maxLengthsLoading])

  useEffect(() => {
    if (!contractsLoading && !dappTokensLoading && contractsData && dappTokensData) {
      initializeDAPPTokens(dappTokensData)
    }
  }, [contractsLoading, dappTokensLoading])

  useEffect(() => {
    if (!mvkLoading && mvkData) {
      updateMVKFaucetAddress(mvkData)
    }
  }, [mvkLoading])
}
