import { usePrevious } from 'react-use'
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'

// context
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useApolloContext } from 'providers/ApolloProvider/apollo.provider'
import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch'

// types
import {
  VaultsContext,
  NullableVaultsCtxState,
  VaultsSubsRecordType,
  VaultsDashboardDataType,
  VaultsIndexerDataType,
} from './vaults.provider.types'

// consts
import {
  GET_ALL_VAULTS_QUERY,
  GET_USER_ALL_VAULTS_QUERY,
  GET_USER_DEPOSITOR_ALL_VAULTS_QUERY,
} from './queries/vaults.query'
import {
  DEFAULT_VAULTS_ACTIVE_SUBS,
  DEFAULT_VAULTS_CONTEXT,
  VAULTS_ALL,
  VAULTS_DATA,
  VAULTS_USER_ALL,
  VAULTS_USER_DEPOSITOR,
} from './vaults.provider.consts'

// utils
import { normalizeVaults } from './helpers/vaults.normalizer'
import { getVaultsProviderReturnValue } from './helpers/vaults.utils'

export const vaultsContext = React.createContext<VaultsContext>(undefined!)

type Props = {
  children: React.ReactNode
}

// TODO: if will need implement query that will take vaults where owner === current user and market token === vault loan token
export const VaultsProvider = ({ children }: Props) => {
  const { userAddress } = useUserContext()
  const { handleApolloError } = useApolloContext()

  const prevUserAddress = usePrevious(userAddress)

  const [activeSubs, setActiveSubs] = useState<VaultsSubsRecordType>(DEFAULT_VAULTS_ACTIVE_SUBS)
  const [vaultsCtxState, setVaultsCtxState] = useState<NullableVaultsCtxState>(DEFAULT_VAULTS_CONTEXT)

  useEffect(() => {
    if (prevUserAddress !== userAddress) {
      setVaultsCtxState((prev) => ({
        ...prev,
        permissionedVaultsIds: null,
        myVaultsIds: null,
      }))
    }
  }, [userAddress])

  useQueryWithRefetch(GET_USER_DEPOSITOR_ALL_VAULTS_QUERY, {
    skip: !userAddress || activeSubs[VAULTS_DATA] !== VAULTS_USER_DEPOSITOR,
    variables: {
      userAddress: userAddress ?? '',
    },
    onCompleted: (data) => updateVaultsData(data, VAULTS_USER_DEPOSITOR),
    onError: (error) => handleApolloError(error, 'GET_USER_DEPOSITOR_ALL_VAULTS_QUERY'),
  })

  useQueryWithRefetch(GET_USER_ALL_VAULTS_QUERY, {
    skip: !userAddress || activeSubs[VAULTS_DATA] !== VAULTS_USER_ALL,
    variables: {
      userAddress: userAddress ?? '',
    },
    onCompleted: (data) => updateVaultsData(data, VAULTS_USER_ALL),
    onError: (error) => handleApolloError(error, 'GET_USER_ALL_VAULTS_QUERY'),
  })

  useQueryWithRefetch(GET_ALL_VAULTS_QUERY, {
    skip: activeSubs[VAULTS_DATA] !== VAULTS_ALL,
    onCompleted: (data) => updateVaultsData(data, VAULTS_ALL),
    onError: (error) => handleApolloError(error, 'GET_ALL_VAULTS_QUERY'),
  })

  const updateVaultsData = (indexerData: VaultsIndexerDataType, subType: VaultsSubsRecordType['vaultsData']) => {
    const { vaultsMapper, allVaultsIds, myVaultsIds, permissionedVaultsIds } = normalizeVaults({
      indexerData,
      userAddress,
    })

    const isAllVaultsQuery = subType === VAULTS_ALL
    const isPermissionedVaultsQuery = subType === VAULTS_USER_DEPOSITOR
    const isMyVaultsQuery = subType === VAULTS_USER_ALL

    setVaultsCtxState((prev) => ({
      ...prev,
      vaultsMapper: { ...prev.vaultsMapper, ...vaultsMapper },
      allVaultsIds: isAllVaultsQuery ? allVaultsIds : prev.allVaultsIds,
      permissionedVaultsIds:
        isAllVaultsQuery || isPermissionedVaultsQuery ? permissionedVaultsIds : prev.permissionedVaultsIds,
      myVaultsIds: isAllVaultsQuery || isMyVaultsQuery ? myVaultsIds : prev.myVaultsIds,
    }))
  }

  const setVaultsDashboardData = (newVaultsDashboardData: VaultsDashboardDataType) => {
    setVaultsCtxState((prev) => ({
      ...prev,
      vaultsDashboardData: newVaultsDashboardData,
    }))
  }

  const changeVaultsSubscriptionsList = (newSkips: Partial<VaultsSubsRecordType>) => {
    setActiveSubs((prev) => ({ ...prev, ...newSkips }))
  }

  const providerValue = useMemo(
    () =>
      getVaultsProviderReturnValue({
        vaultsCtxState,
        activeSubs,
        changeVaultsSubscriptionsList,
        setVaultsDashboardData,
        userAddress,
      }),
    [vaultsCtxState, activeSubs],
  )

  return <vaultsContext.Provider value={providerValue}>{children}</vaultsContext.Provider>
}

export const useVaultsContext = () => {
  const context = useContext(vaultsContext)

  if (!context) {
    throw new Error('vaultsContext should be used within VaultsProvider')
  }

  return context
}

export default VaultsProvider
