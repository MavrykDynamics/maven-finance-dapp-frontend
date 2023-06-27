import React, { useContext, useEffect, useMemo, useState } from 'react'

// contexts
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useSubscription } from '@apollo/client'

// types
import { DappConfigContext, UserActionType } from './dappConfig.provider.types'

// consts
import { SUBSCRIPTION_INDEXER_LVL } from './queries/indexerLvl.query'
import { TOASTER_TEXTS } from 'app/App.components/Toaster/texts/toaster.texts'
import { TOASTER_SUBSCRIPTION_ERROR } from 'providers/ToasterProvider/toaster.provider.const'
import { TOASTER_ACTIONS_TEXTS } from 'app/App.components/Toaster/texts/toasterActions.texts'

// helpers
import { sleep } from 'utils/api/sleep'

export const dappConfigContext = React.createContext<DappConfigContext>(undefined!)

type Props = {
  children: React.ReactNode
}

const DappConfigProvider = ({ children }: Props) => {
  const { bug, hideToasterMessage, success } = useToasterContext()

  const [currentIndexedLevel, setCurrentIndexedLevel] = useState<number | null>(null)
  const [action, setAction] = useState<UserActionType | null>(null)

  const { loading: isLvlLoading } = useSubscription(SUBSCRIPTION_INDEXER_LVL, {
    skip: !action,
    shouldResubscribe: true,
    onData: ({ data: { data } }) => {
      if (!data) return

      const indexerLvl = data.dipdup_head.find(({ name }) => name.includes('ghostnet'))?.level
      if (indexerLvl) setCurrentIndexedLevel(indexerLvl)
    },
    onError: (error) => {
      console.error(`SUBSCRIPTION_INDEXER_LVL query error: `, error)
      bug(TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['message'], TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
    },
  })

  useEffect(() => {
    if (!action || !currentIndexedLevel) return

    const { actionName, toasterId, operationLvl } = action
    const turnOffAction = async () => {
      await sleep(1000)
      hideToasterMessage(toasterId)
      await sleep(500)
      success(TOASTER_ACTIONS_TEXTS[actionName]['end']['message'], TOASTER_ACTIONS_TEXTS[actionName]['end']['title'])

      setAction(null)
    }

    if (currentIndexedLevel >= operationLvl) turnOffAction()
  }, [action, currentIndexedLevel, hideToasterMessage, success])

  const contextProviderValue = useMemo(() => {
    return {
      currentIndexedLevel,
      isLoading: isLvlLoading,
      setAction,
    }
  }, [currentIndexedLevel, isLvlLoading])

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
