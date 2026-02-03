import React, { useCallback, useContext, useMemo, useState } from 'react'

// hooks
import { useGraphQLQuery } from 'providers/QueryProvider/useGraphQLQuery'
import { useQueryProvider } from 'providers/QueryProvider/query.provider'

// consts
import { CONTRACT_STATUSES_CONFIG_QUERY } from './queries/contractStatusConfig.query'
import {
  CONTRACT_STATUSES_ALL_SUB,
  CONTRACT_STATUSES_CONFIG_SUB,
  DEFAULT_CONTRACT_STATUSES_ACTIVE_SUBS,
  DEFAULT_CONTRACT_STATUSES_CTX,
  EMPTY_CONTRACT_STATUSES_CTX,
} from './helpers/contractStatuses.consts'
import { CONTRACT_STATUSES_ALL_DATA_QUERY } from './queries/contractStatuses.query'

// types
import {
  ContractStatusesContext,
  ContractStatusesSubsRecordType,
  NullableContractStatusesContextStateType,
} from './contractStatuses.provider.types'

// utils
import { normalizeContractStatuses } from './helpers/normalizeContractStatuses'
import {
  getContractMethodsPausedStatus,
  getContractStatusesProviderReturnValue,
  normalizeContractStatusesConfig,
} from './helpers/contractStatuses.utils'

export const contractStatusesContext = React.createContext<ContractStatusesContext>(undefined!)

type Props = {
  children: React.ReactNode
}

const ContractStatusesProvider = ({ children }: Props) => {
  const { handleQueryError } = useQueryProvider()

  const [contractStatusesCtxState, setContractStatusesCtxState] =
    useState<NullableContractStatusesContextStateType>(DEFAULT_CONTRACT_STATUSES_CTX)
  const [activeSubs, setActiveSubs] = useState<ContractStatusesSubsRecordType>(DEFAULT_CONTRACT_STATUSES_ACTIVE_SUBS)

  useGraphQLQuery(CONTRACT_STATUSES_CONFIG_QUERY, {
    skip: !activeSubs[CONTRACT_STATUSES_CONFIG_SUB],
    onCompleted: (data) => {
      setContractStatusesCtxState((prev) => ({
        ...prev,
        config: normalizeContractStatusesConfig(data),
      }))
    },
    onError: (error) => handleQueryError(error, 'CONTRACT_STATUSES_CONFIG_QUERY'),
  })

  useGraphQLQuery(CONTRACT_STATUSES_ALL_DATA_QUERY, {
    skip: !activeSubs[CONTRACT_STATUSES_ALL_SUB],
    variables: {},
    onCompleted: (data) => {
      const normalizedContractStatuses = normalizeContractStatuses(data)
      const areContractMethodsPaused = getContractMethodsPausedStatus(normalizedContractStatuses, 85)

      setContractStatusesCtxState((prev) => ({
        ...prev,
        config: {
          ...(prev.config ?? EMPTY_CONTRACT_STATUSES_CTX.config),
          areContractMethodsPaused,
        },
        contractStatuses: normalizedContractStatuses,
      }))
    },
    onError: (error) => handleQueryError(error, 'CONTRACT_STATUSES_ALL_DATA_QUERY'),
  })

  const changeContractStatusesSubscriptionsList = useCallback((newSkips: Partial<ContractStatusesSubsRecordType>) => {
    setActiveSubs((prev) => ({ ...prev, ...newSkips }))
  }, [])

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
