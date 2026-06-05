import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'

// hooks
import { useQueryProvider } from 'providers/QueryProvider/query.provider'
import { useGraphQLQueryOnce } from 'providers/QueryProvider/useGraphQLQuery'
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
import { getMavrykValidators } from './bakers/getMavrykValidators'
import { dappConfigSchema } from './helpers/dappConfig.schemes'
import { normalizeContractAddresses, normalizeInitialConfigData } from './helpers/dappConfig.normalizers'

export const dappConfigContext = React.createContext<DappConfigContext>(undefined!)

type Props = {
  children: React.ReactNode
}

// TODO: handle initial loading with null values
const DappConfigProvider = ({ children }: Props) => {
  const { handleQueryError } = useQueryProvider()
  const { bug } = useToasterContext()

  const [dappConfigCtxState, setDappConfigCtxState] = useState<DappConfigContextStateType>(DEFAULT_DAPP_CONFIG_CONTEXT)

  // check whether keys for ipfs (image selection) are valid
  useEffect(() => {
    const projectId = import.meta.env.VITE_IPFS_PROJECT_ID
    const projectSecret = import.meta.env.VITE_IPFS_API_KEY

    // Skip the network check if credentials are not configured
    if (!projectId || !projectSecret) return

    const checkIPFS = async () => {
      try {
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
  const { isLoading: initialConfigLoading } = useGraphQLQueryOnce(DAPP_INITIAL_CONFIG_QUERY, {
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
    onError: (error) => handleQueryError(error, 'DAPP_INITIAL_CONFIG_QUERY'),
  })

  // TODO: addresses that are general, not page specific load in DAPP_INITIAL_CONFIG_QUERY other addresses load only on pages that requires them
  const { isLoading: contractAddressesLoading } = useGraphQLQueryOnce(GET_DAPP_CONTRACT_ADDRESSES, {
    variables: {},
    onCompleted: (data) => {
      setDappConfigCtxState((prev) => ({
        ...prev,
        contractAddresses: normalizeContractAddresses(data),
      }))
    },
    onError: (error) => handleQueryError(error, 'GET_DAPP_CONTRACT_ADDRESSES'),
  })

  // Validators change at epoch boundaries (hours). Fetch once per session —
  // guard against repeated calls if the state is reset.
  const validatorsFetchedRef = useRef(false)
  useEffect(() => {
    if (!dappConfigCtxState.mavrykValidators && !validatorsFetchedRef.current) {
      validatorsFetchedRef.current = true
      updateMavrykValidators()
    }
  }, [dappConfigCtxState.mavrykValidators])

  const updateMavrykValidators = async () => {
    const mavrykValidators = await getMavrykValidators()

    setDappConfigCtxState((prev) => ({
      ...prev,
      mavrykValidators,
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
