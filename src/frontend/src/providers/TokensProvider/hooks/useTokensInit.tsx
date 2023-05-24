import { useEffect, useState } from 'react'
import { useTokensContext } from '../tokens.provider'
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'
import { useQuery } from '@apollo/client'

// queries
import {
  GET_GOVERNANCE_CONTRACT_ADDRESS_QUERY,
  GET_DAPP_TOKENS_QUERY,
  GET_MVK_FAUCET_QUERY,
  GET_AVAILABLE_COLLATERALS,
} from 'gql/queries/getTokensData'

type InternalState = {
  tokensAddress: string | null
}

export const useTokensInit = () => {
  const [state, setState] = useState<InternalState>({ tokensAddress: null })
  const { initializeDAPPTokens, updateCollateralsData } = useTokensContext()

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
  const { data: collateralData, loading: collateralLoading } = useQuery(GET_AVAILABLE_COLLATERALS)

  useEffect(() => {
    if (!contractsLoading && !dappTokensLoading && contractsData && dappTokensData) {
      initializeDAPPTokens(dappTokensData)
    }
  }, [contractsLoading, dappTokensLoading])

  useEffect(() => {
    if (!collateralLoading && collateralData) {
      updateCollateralsData(collateralData)
    }
  }, [collateralLoading])
}
