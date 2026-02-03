import React, { useContext, useEffect, useMemo, useState } from 'react'
import { useQuery } from '@apollo/client'

// hooks
import { useApolloContext } from 'providers/ApolloProvider/apollo.provider'
import { useDappConfigMethods } from './hooks/useDappConfigMethods'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

// types
import { DappConfigContext, DappConfigContextStateType } from './dappConfig.provider.types'

// consts
import { DEFAULT_DAPP_CONFIG_CONTEXT } from './helpers/dappConfig.const'
import { DAPP_INITIAL_CONFIG_QUERY } from './queries/dappConfig.query'
import { GET_DAPP_CONTRACT_ADDRESSES } from './queries/contractAddresses.query'
import { ipfsClient } from 'app/App.components/IPFSUploader/IPFSUploader.controller'

// utils
import { getXTZBakers } from './bakers/getXtzBakers'
import { dappConfigSchema } from './helpers/dappConfig.schemes'
import { normalizeContractAddresses, normalizeInitialConfigData } from './helpers/dappConfig.normalizers'

export const dappConfigContext = React.createContext<DappConfigContext>(undefined!)

type Props = {
  children: React.ReactNode
}

// TODO: handle initial loading with null values
const DappConfigProvider = ({ children }: Props) => {
  const { handleApolloError } = useApolloContext()
  const { bug } = useToasterContext()

  const [dappConfigCtxState, setDappConfigCtxState] = useState<DappConfigContextStateType>(DEFAULT_DAPP_CONFIG_CONTEXT)

  // check whether keys for ipfs (image selection) are valid
  useEffect(() => {
    const checkIPFS = async () => {
      try {
        // if keys are invalid it will return error
        await ipfsClient.version()
        setDappConfigCtxState((prev) => ({ ...prev, canUseIpfs: true }))
      } catch (e) {
        bug('IPFS auth keys are invalid, image selection will be disabled', 'Keys are invalid')
      }
    }
    checkIPFS()
  }, [])

  const {
    setDappTotalValueLocked,
    handleCopyText,
    toggleTheme,
    toggleRPCNodePopup,
    selectNewRPCNode,
    setNewRPCNodes,
    toggleSidebarCollapsing,
    toggleActionFullScreenLoader,
    toggleActionCompletion,
    toggleWertLoader,
  } = useDappConfigMethods({ setDappConfigCtxState })

  // Load initial data for dapp (max lengths, mvnFaucet, minSmvnAmount)
  const { loading: initialConfigLoading } = useQuery(DAPP_INITIAL_CONFIG_QUERY, {
    onCompleted: (data) => {
      try {
        const parsedConfig = dappConfigSchema.parse(data)
        const { maxLengths, minimumStakedMvnBalance, mvnFaucetAddress } = normalizeInitialConfigData(parsedConfig)
        setDappConfigCtxState((prev) => ({
          ...prev,
          maxLengths: maxLengths,
          minimumStakedMvnBalance: minimumStakedMvnBalance,
          mvnFaucetAddress: mvnFaucetAddress,
        }))
      } catch (e) {
        console.error('zod parsing DAPP_INITIAL_CONFIG_QUERY error:', { e })
      }
    },
    onError: (error) => handleApolloError(error, 'DAPP_INITIAL_CONFIG_QUERY'),
  })

  // TODO: addresses that are general, not page specific load in DAPP_INITIAL_CONFIG_QUERY other addresses load only on pages that requires them
  const { loading: contractAddressesLoading } = useQuery(GET_DAPP_CONTRACT_ADDRESSES, {
    variables: {},
    onCompleted: (data) => {
      setDappConfigCtxState((prev) => ({
        ...prev,
        contractAddresses: normalizeContractAddresses(data),
      }))
    },
    onError: (error) => handleApolloError(error, 'GET_DAPP_CONTRACT_ADDRESSES'),
  })

  // TODO: move it to the custom hook for bakers
  useEffect(() => {
    if (!dappConfigCtxState.xtzBakers) {
      updateXtzBakers()
    }
  }, [dappConfigCtxState.xtzBakers])

  const updateXtzBakers = async () => {
    const xtzBakers = await getXTZBakers()

    setDappConfigCtxState((prev) => ({
      ...prev,
      xtzBakers,
    }))
  }

  const contextProviderValue = useMemo(() => {
    return {
      isLoading: initialConfigLoading || contractAddressesLoading,
      setDappTotalValueLocked,
      handleCopyText,
      toggleTheme,
      toggleRPCNodePopup,
      selectNewRPCNode,
      setNewRPCNodes,
      toggleSidebarCollapsing,
      toggleActionFullScreenLoader,
      toggleActionCompletion,
      toggleWertLoader,
      ...dappConfigCtxState,
    }
  }, [dappConfigCtxState, initialConfigLoading, contractAddressesLoading])

  return <dappConfigContext.Provider value={contextProviderValue}>{children}</dappConfigContext.Provider>
}

export const useDappConfigContext = () => {
  const context = useContext(dappConfigContext)

  if (!context) {
    throw new Error('dappConfigContext should be used withing DappConfigProvider')
  }

  return context
}

export default DappConfigProvider
