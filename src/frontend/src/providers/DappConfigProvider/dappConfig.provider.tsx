import React, { useContext, useEffect, useMemo, useState } from 'react'
import { useQuery, useSubscription } from '@apollo/client'

// hooks
import { useApolloContext } from 'providers/ApolloProvider/apollo.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

// types
import { DappConfigContext, DappConfigContextStateType, RPCNodeType, UserActionType } from './dappConfig.provider.types'
import { ThemeType } from 'consts/theme.const'

// consts
import { SUBSCRIPTION_INDEXER_LVL } from './queries/indexerLvl.query'
import { DEFAULT_DAPP_CONFIG_CONTEXT, RPC_NODE } from './helpers/dappConfig.const'
import { DAPP_INITIAL_CONFIG_QUERY } from './queries/config.query'
import { GET_DAPP_CONTRACT_ADDRESSES } from './queries/contractAddresses.query'
import { TOASTER_ACTIONS_TEXTS } from 'app/App.components/Toaster/texts/toasterActions.texts'

// utils
import { getXTZBakers } from './bakers/getXtzBakers'
import { setItemInStorage } from 'utils/storage'
import { dappConfigSchema, indexerLevelSchema } from './helpers/dappConfig.schemes'
import { currentIndexerLevelProxy } from 'providers/common/utils/observeCurrentIndexerLevel'
import { unknownToError } from 'errors/error'
import { sleep } from 'utils/api/sleep'
import { normalizeContractAddresses, normalizeInitialConfigData } from './helpers/dappConfig.normalizers'

export const dappConfigContext = React.createContext<DappConfigContext>(undefined!)

type Props = {
  children: React.ReactNode
}

// TODO: handle initial loading with null values
const DappConfigProvider = ({ children }: Props) => {
  const { handleApolloError } = useApolloContext()
  const { bug, hideToasterMessage, success } = useToasterContext()

  // HANDLING DATA UPDATE LOADER STATE AFTER USER FIRED ACTION
  const [action, setAction] = useState<UserActionType | null>(null)

  /**
   * Subscribe to lvl that currently performed by indexer, to:
   *
   * 1. refetch queries, that requires update on lvl change
   * 2. handle action toasters, to show that action is performing, already performed
   */
  const { data: indexerLevel } = useSubscription(SUBSCRIPTION_INDEXER_LVL, {
    shouldResubscribe: true,
    onData: ({ data: { data } }) => {
      if (!data) return
      try {
        const parsedLevelData = indexerLevelSchema.parse(data.dipdup_index)

        if (currentIndexerLevelProxy.currentIndexedLevel < parsedLevelData[0].level) {
          if (process.env.REACT_APP_ENV === 'dev')
            console.log(`%cnew indexer level: ${parsedLevelData[0].level}`, 'color: fuchsia')

          currentIndexerLevelProxy.currentIndexedLevel = parsedLevelData[0].level
        }
      } catch (e) {
        console.error('zod parsing SUBSCRIPTION_INDEXER_LVL error:', { e })
      }
    },
    onError: (error) => {
      handleApolloError(error, 'SUBSCRIPTION_INDEXER_LVL')

      if (action && action.toasterId) {
        hideToasterMessage(action.toasterId)
        setAction(null)
      }
    },
  })

  /**
   * effect to handle action toasters and turn them off when level of operation is already performed by indexer
   */
  useEffect(() => {
    if (!action || !indexerLevel) return
    const parsedLevelData = indexerLevelSchema.safeParse(indexerLevel.dipdup_index)

    const currentIndexedLevel = parsedLevelData.success ? parsedLevelData.data[0].level : null

    if (!currentIndexedLevel) return

    const { actionName, toasterId, operationLvl, callback } = action
    const turnOffAction = async () => {
      // if we don't have toasterId it means that action is silent, and we don't show anything to user
      if (toasterId) {
        await sleep(850)
        hideToasterMessage(toasterId)
        await sleep(850)
        success(TOASTER_ACTIONS_TEXTS[actionName]['end']['message'], TOASTER_ACTIONS_TEXTS[actionName]['end']['title'])
      }
      toggleActionCompletion(false)

      // some callback f.e. to reset input, clear form data etc.
      await callback?.()
      setAction(null)
    }

    if (currentIndexedLevel >= operationLvl) turnOffAction()
  }, [action, indexerLevel])

  const [dappConfigCtxState, setDappConfigCtxState] = useState<DappConfigContextStateType>(DEFAULT_DAPP_CONFIG_CONTEXT)

  // Load initial data for dapp (max lenghts, mvkFaucet, minSmvkAmount)
  const { loading: initialConfigLoading } = useQuery(DAPP_INITIAL_CONFIG_QUERY, {
    onCompleted: (data) => {
      try {
        const parsedConfig = dappConfigSchema.parse(data)

        const { maxLenghts, minimumStakedMvkBalance, mvkFaucetAddress } = normalizeInitialConfigData(parsedConfig)
        setDappConfigCtxState((prev) => ({
          ...prev,
          maxLenghts,
          minimumStakedMvkBalance,
          mvkFaucetAddress,
        }))
      } catch (e) {
        console.error('zod parsing DAPP_INITIAL_CONFIG_QUERY error:', { e })
      }
    },
    onError: (error) => handleApolloError(error, 'DAPP_INITIAL_CONFIG_QUERY'),
  })

  // TODO: addresses that are general, not page specific load in DAPP_INITIAL_CONFIG_QUERY other addresses load only on pages that requires them
  const { loading: contractAddressesLoading } = useQuery(GET_DAPP_CONTRACT_ADDRESSES, {
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

  // -------- METHODS --------

  // preferences actions
  const toggleTheme = (theme: ThemeType) => {
    try {
      setItemInStorage('theme', theme)
      setDappConfigCtxState((prev) => ({ ...prev, preferences: { ...prev.preferences, themeSelected: theme } }))
    } catch (e) {
      const err = unknownToError(e)
      bug(err)
    }
  }

  const toggleRPCNodePopup = (isOpened: boolean) => {
    setDappConfigCtxState((prev) => ({ ...prev, preferences: { ...prev.preferences, changeNodePopupOpen: isOpened } }))
  }

  const selectNewRPCNode = (newRPCNode: string) => {
    setItemInStorage(RPC_NODE, newRPCNode)
    setDappConfigCtxState((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, REACT_APP_RPC_PROVIDER: newRPCNode },
    }))
  }

  const setNewRPCNodes = (newRPCNodes: Array<RPCNodeType>) => {
    setDappConfigCtxState((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, RPC_NODES: newRPCNodes },
    }))
  }

  const toggleSidebarCollapsing = (isOpened?: boolean) => {
    setDappConfigCtxState((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, sidebarOpened: isOpened ?? !dappConfigCtxState.preferences.sidebarOpened },
    }))
  }

  // loading actions
  const toggleActionFullScreenLoader = (value: boolean) => {
    setDappConfigCtxState((prev) => ({
      ...prev,
      globalLoadingState: { ...prev.globalLoadingState, isActiveFullScreenLoader: value },
    }))
  }

  const toggleActionCompletion = (value: boolean) => {
    setDappConfigCtxState((prev) => ({
      ...prev,
      globalLoadingState: { ...prev.globalLoadingState, isActionActive: value },
    }))
  }

  const toggleWertLoader = (value: boolean) => {
    setDappConfigCtxState((prev) => ({
      ...prev,
      globalLoadingState: { ...prev.globalLoadingState, isWertLoading: value },
    }))
  }

  const setDappTotalValueLocked = (newTvlValie: number) => {
    setDappConfigCtxState((prev) => ({
      ...prev,
      dappTotalValueLocked: newTvlValie,
    }))
  }

  const contextProviderValue = useMemo(() => {
    return {
      isLoading: initialConfigLoading || contractAddressesLoading,
      setAction,
      setDappTotalValueLocked,
      // preferences
      toggleTheme,
      toggleRPCNodePopup,
      selectNewRPCNode,
      setNewRPCNodes,
      toggleSidebarCollapsing,
      // loading
      toggleActionFullScreenLoader,
      toggleActionCompletion,
      toggleWertLoader,
      ...dappConfigCtxState,
    }
  }, [dappConfigCtxState])

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
