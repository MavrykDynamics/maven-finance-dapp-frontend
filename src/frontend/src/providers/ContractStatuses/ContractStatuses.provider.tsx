import { ApolloError } from '@apollo/client'
import React, { useCallback, useContext, useMemo, useState } from 'react'

// consts
import { TOASTER_TEXTS } from 'app/App.components/Toaster/texts/toaster.texts'
import { TOASTER_SUBSCRIPTION_ERROR } from 'providers/ToasterProvider/toaster.provider.const'
import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch'
import { CONTRACT_STATUSES_CONFIG_QUERY } from './queries/contractStatusConfig.query'
import {
  ContractStatusesContext,
  ContractStatusesSubsRecordType,
  NullableContractStatusesContextStateType,
} from './contractStatuses.types'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { DEFAULT_CONTRACT_STATUSES_ACTIVE_SUBS, DEFAULT_CONTRACT_STATUSES_CTX } from './helpers/contractStatuses.consts'
import {
  getContractStatusesProviderReturnValue,
  normalizeContractStatusesConfig,
} from './helpers/contractStatuses.utils'

export const contractStatusesContext = React.createContext<ContractStatusesContext>(undefined!)

type Props = {
  children: React.ReactNode
}

const ContractStatusesProvider = ({ children }: Props) => {
  const { bug } = useToasterContext()

  const [contractStatusesCtxState, setContractStatusesCtxState] =
    useState<NullableContractStatusesContextStateType>(DEFAULT_CONTRACT_STATUSES_CTX)
  const [isConfigSubActive, setIsConfigSubActive] = useState(false)
  const [activeSubs, setActiveSubs] = useState<ContractStatusesSubsRecordType>(DEFAULT_CONTRACT_STATUSES_ACTIVE_SUBS)

  const handleSubError = (error: ApolloError, subName: string) => {
    console.error(`${subName} query error: `, error)
    bug(TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['message'], TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
  }

  // sub to config
  useQueryWithRefetch(
    CONTRACT_STATUSES_CONFIG_QUERY,
    {
      skip: !isConfigSubActive,
      onCompleted: (data) => {
        if (!data) return
        const config = normalizeContractStatusesConfig(data)
        setContractStatusesConfig(config)
      },
      onError: (error) => handleSubError(error, 'CONTRACT_STATUSES_CONFIG_QUERY'),
    },
    {
      blocksDiff: 2000,
    },
  )

  const setContractStatusesConfig = (config: NullableContractStatusesContextStateType['config']) => {
    setContractStatusesCtxState((prev) => ({
      ...prev,
      config,
    }))
  }

  const changeLoansSubscriptionsList = (newSkips: Partial<ContractStatusesSubsRecordType>) => {
    setActiveSubs((prev) => ({ ...prev, ...newSkips }))
  }

  const contextProviderValue = useMemo(
    () =>
      getContractStatusesProviderReturnValue({
        contractStatusesCtxState,
        changeLoansSubscriptionsList,
      }),
    [contractStatusesCtxState],
  )

  return <contractStatusesContext.Provider value={contextProviderValue}>{children}</contractStatusesContext.Provider>
}

export const useContractStatusesContext = () => {
  const context = useContext(contractStatusesContext)

  if (!context) {
    throw new Error('useContractStatusesContext should be used within ContractStatusesProvider')
  }

  return context
}

export default ContractStatusesProvider
