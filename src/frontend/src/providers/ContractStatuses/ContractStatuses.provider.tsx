import { ApolloError, useQuery } from '@apollo/client'
import React, { useContext, useMemo, useState } from 'react'

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
import {
  CONTRACT_STATUSES_ALL_SUB,
  CONTRACT_STATUSES_CONFIG_SUB,
  DEFAULT_CONTRACT_STATUSES_ACTIVE_SUBS,
  DEFAULT_CONTRACT_STATUSES_CTX,
} from './helpers/contractStatuses.consts'
import {
  getContractStatusesProviderReturnValue,
  normalizeContractStatusesConfig,
} from './helpers/contractStatuses.utils'
import { CONTRACT_STATUSES_ALL_DATA_QUERY } from './queries/contractStatuses.query'
import { normalizeContractStatuses } from './helpers/normalizeContractStatuses'

export const contractStatusesContext = React.createContext<ContractStatusesContext>(undefined!)

type Props = {
  children: React.ReactNode
}

const ContractStatusesProvider = ({ children }: Props) => {
  const { bug } = useToasterContext()

  const [contractStatusesCtxState, setContractStatusesCtxState] =
    useState<NullableContractStatusesContextStateType>(DEFAULT_CONTRACT_STATUSES_CTX)
  const [activeSubs, setActiveSubs] = useState<ContractStatusesSubsRecordType>(DEFAULT_CONTRACT_STATUSES_ACTIVE_SUBS)

  const handleSubError = (error: ApolloError, subName: string) => {
    console.error(`${subName} query error: `, error)
    bug(TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['message'], TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
  }

  // sub to config
  useQueryWithRefetch(
    CONTRACT_STATUSES_CONFIG_QUERY,
    {
      skip: !activeSubs[CONTRACT_STATUSES_CONFIG_SUB],
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

  // sub to all data only once
  useQuery(CONTRACT_STATUSES_ALL_DATA_QUERY, {
    skip: !activeSubs[CONTRACT_STATUSES_ALL_SUB],
    onCompleted: (data) => {
      if (!data) return

      const normalizedContractStatuses = normalizeContractStatuses(data)
      setContractStatusesCtxState((prev) => ({
        ...prev,
        contractStatuses: normalizedContractStatuses,
      }))
    },
    onError: (error) => handleSubError(error, 'CONTRACT_STATUSES_ALL_DATA_QUERY'),
  })

  const setContractStatusesConfig = (config: NullableContractStatusesContextStateType['config']) => {
    setContractStatusesCtxState((prev) => ({
      ...prev,
      config,
    }))
  }

  const changeContractStatusesSubscriptionsList = (newSkips: Partial<ContractStatusesSubsRecordType>) => {
    setActiveSubs((prev) => ({ ...prev, ...newSkips }))
  }

  const contextProviderValue = useMemo(
    () =>
      getContractStatusesProviderReturnValue({
        contractStatusesCtxState,
        changeContractStatusesSubscriptionsList,
        activeSubs,
      }),
    [activeSubs, contractStatusesCtxState],
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
