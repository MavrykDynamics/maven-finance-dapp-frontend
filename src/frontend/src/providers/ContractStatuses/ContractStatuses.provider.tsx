import { useQuery } from '@apollo/client'
import React, { useContext, useMemo, useState } from 'react'

// hooks
import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch'
import { useApolloContext } from 'providers/ApolloProvider/apollo.provider'

// consts
import { CONTRACT_STATUSES_CONFIG_QUERY } from './queries/contractStatusConfig.query'
import {
  CONTRACT_STATUSES_ALL_SUB,
  CONTRACT_STATUSES_CONFIG_SUB,
  DEFAULT_CONTRACT_STATUSES_ACTIVE_SUBS,
  DEFAULT_CONTRACT_STATUSES_CTX,
} from './helpers/contractStatuses.consts'
import { CONTRACT_STATUSES_ALL_DATA_QUERY } from './queries/contractStatuses.query'

// types
import {
  ContractStatusesContext,
  ContractStatusesSubsRecordType,
  NullableContractStatusesContextStateType,
} from './contractStatuses.types'

// utils
import { normalizeContractStatuses } from './helpers/normalizeContractStatuses'
import {
  getContractStatusesProviderReturnValue,
  normalizeContractStatusesConfig,
} from './helpers/contractStatuses.utils'

export const contractStatusesContext = React.createContext<ContractStatusesContext>(undefined!)

type Props = {
  children: React.ReactNode
}

const ContractStatusesProvider = ({ children }: Props) => {
  const { handleApolloError } = useApolloContext()

  const [contractStatusesCtxState, setContractStatusesCtxState] =
    useState<NullableContractStatusesContextStateType>(DEFAULT_CONTRACT_STATUSES_CTX)
  const [activeSubs, setActiveSubs] = useState<ContractStatusesSubsRecordType>(DEFAULT_CONTRACT_STATUSES_ACTIVE_SUBS)

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
      onError: (error) => handleApolloError(error, 'CONTRACT_STATUSES_CONFIG_QUERY'),
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
    onError: (error) => handleApolloError(error, 'CONTRACT_STATUSES_ALL_DATA_QUERY'),
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
