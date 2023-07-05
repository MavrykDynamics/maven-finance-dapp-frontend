import React, { useContext, useEffect, useMemo, useState } from 'react'

// contexts
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { ApolloError, useQuery, useSubscription } from '@apollo/client'

// types
import { DappConfigContext, DappConfigContextStateType, UserActionType } from './dappConfig.provider.types'

// consts
import { SUBSCRIPTION_INDEXER_LVL } from './queries/indexerLvl.query'
import { TOASTER_TEXTS } from 'app/App.components/Toaster/texts/toaster.texts'
import { TOASTER_SUBSCRIPTION_ERROR } from 'providers/ToasterProvider/toaster.provider.const'
import { MVK_DECIMALS } from 'utils/constants'
import { DAPP_DEFAULT_MAX_LENGHTS, DEFAULT_DAPP_CONFIG_CONTEXT } from './helpers/dappConfig.const'
import { TOASTER_ACTIONS_TEXTS } from 'app/App.components/Toaster/texts/toasterActions.texts'

// helpers
import { sleep } from 'utils/api/sleep'
import { normalizeContractAddresses, normalizerMaxLenghts } from './helpers/dappConfig.normalizers'
import { convertNumberForClient } from 'utils/calcFunctions'

// queries
import { GET_MAX_LENGTHS_QUERY } from './queries/maxLenghts.query'
import { getXTZBakers } from './bakers/getXtzBakers'
import { GET_MVK_FAUCET_QUERY, GET_SATELLITE_MIN_STAKED_AMOUNT_QUERY } from './queries/config.query'
import { GET_DAPP_CONTRACT_ADDRESSES } from './queries/contractAddresses.query'

export const dappConfigContext = React.createContext<DappConfigContext>(undefined!)

type Props = {
  children: React.ReactNode
}

const DappConfigProvider = ({ children }: Props) => {
  const handleSubError = (error: ApolloError) => {
    console.error(`DappConfigProvider query error: `, error)
    bug(TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['message'], TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
  }

  // HANDLING DATA UPDATE LOADER STATE AFTER USER FIRED ACTION
  const { bug, hideToasterMessage, success } = useToasterContext()

  const [currentIndexedLevel, setCurrentIndexedLevel] = useState<number | null>(null)
  const [action, setAction] = useState<UserActionType | null>(null)

  useSubscription(SUBSCRIPTION_INDEXER_LVL, {
    skip: !action,
    shouldResubscribe: true,
    onData: ({ data: { data } }) => {
      if (!data) return

      const indexerLvl = data.dipdup_head.find(({ name }) => name === process.env.REACT_APP_RPC_TZKT_API)?.level
      if (indexerLvl) setCurrentIndexedLevel(indexerLvl)
    },
    onError: (error) => {
      console.error(`SUBSCRIPTION_INDEXER_LVL query error: `, error)
      bug(TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['message'], TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])

      if (action) {
        hideToasterMessage(action.toasterId)
        setAction(null)
      }
    },
  })

  useEffect(() => {
    if (!action || !currentIndexedLevel) return

    const { actionName, toasterId, operationLvl } = action
    const turnOffAction = async () => {
      await sleep(500)
      hideToasterMessage(toasterId)
      await sleep(500)
      success(TOASTER_ACTIONS_TEXTS[actionName]['end']['message'], TOASTER_ACTIONS_TEXTS[actionName]['end']['title'])

      setAction(null)
    }

    if (currentIndexedLevel >= operationLvl) turnOffAction()
  }, [action, currentIndexedLevel, hideToasterMessage, success])

  // HANDLING INITIAL DATA, THAT SHOULD BE LOADED
  const [dappConfigCtxState, setDappConfigCtxState] = useState<DappConfigContextStateType>(DEFAULT_DAPP_CONFIG_CONTEXT)

  // Load max lenghts for inputs
  const { loading: maxLengthsLoading } = useQuery(GET_MAX_LENGTHS_QUERY, {
    onCompleted: (data) => {
      setDappConfigCtxState((prev) => ({
        ...prev,
        maxLengths: normalizerMaxLenghts(data),
      }))
    },
    onError: handleSubError,
  })

  // Load MVK faucet
  const { loading: mvkFaucetLoading } = useQuery(GET_MVK_FAUCET_QUERY, {
    onCompleted: (data) => {
      setDappConfigCtxState((prev) => ({
        ...prev,
        mvkFaucetAddress: data.mvk_faucet[0]?.address ?? null,
      }))
    },
    onError: handleSubError,
  })

  const { loading: contractAddressesLoading } = useQuery(GET_DAPP_CONTRACT_ADDRESSES, {
    onCompleted: (data) => {
      setDappConfigCtxState((prev) => ({
        ...prev,
        contractAddresses: normalizeContractAddresses(data),
      }))
    },
    onError: handleSubError,
  })

  const { loading: configLoading } = useQuery(GET_SATELLITE_MIN_STAKED_AMOUNT_QUERY, {
    onCompleted: (data) => {
      setDappConfigCtxState((prev) => ({
        ...prev,
        minimumStakedMvkBalance: convertNumberForClient({
          number: data.delegation[0].minimum_smvk_balance,
          grade: MVK_DECIMALS,
        }),
      }))
    },
    onError: handleSubError,
  })

  // TODO: move it to the custom hook
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
      isLoading: maxLengthsLoading || mvkFaucetLoading || configLoading || contractAddressesLoading,
      setAction,
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
