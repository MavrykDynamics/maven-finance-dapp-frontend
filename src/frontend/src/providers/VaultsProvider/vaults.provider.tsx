import { usePrevious } from 'react-use'
import React, { useContext, useEffect, useMemo, useState } from 'react'

// context
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useApolloContext } from 'providers/ApolloProvider/apollo.provider'
import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch'

// types
import { GetUserVaultsQueryQuery } from 'utils/__generated__/graphql'
import {
  VaultsContext,
  NullableVaultsCtxState,
  VaultsSubsRecordType,
  VaultsDashboardDataType,
} from './vaults.provider.types'

// consts
import { GET_ALL_VAULTS_QUERY, getUserVaultsQuery } from './queries/vaults.query'
import {
  DEFAULT_VAULTS_ACTIVE_SUBS,
  DEFAULT_VAULTS_CONTEXT,
  VAULTS_ALL,
  VAULTS_DATA,
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

  useQueryWithRefetch(getUserVaultsQuery({ userAddress, filters: activeSubs[VAULTS_DATA] }), {
    skip:
      activeSubs[VAULTS_DATA] !== 'userIsOwner' &&
      activeSubs[VAULTS_DATA] !== 'userIsDepositor' &&
      Boolean(userAddress),
    variables: {
      userAddress: userAddress ?? '',
    },
    onCompleted: (data) => {
      updateVaultsData(data, userAddress, activeSubs[VAULTS_DATA])
    },
    onError: (error) => handleApolloError(error, 'getUserVaultsQuery'),
  })

  useQueryWithRefetch(GET_ALL_VAULTS_QUERY, {
    skip: activeSubs[VAULTS_DATA] !== 'allVaults',
    onCompleted: (data) => {
      updateVaultsData(data, userAddress, activeSubs[VAULTS_DATA])
    },
    onError: (error) => handleApolloError(error, 'GET_ALL_VAULTS_QUERY'),
  })

  const updateVaultsData = (
    indexerData: GetUserVaultsQueryQuery,
    userAddress: string | null,
    filterType: VaultsSubsRecordType[typeof VAULTS_DATA],
  ) => {
    const { vaultsMapper, allVaultsIds, myVaultsIds, permissionedVaultsIds } = normalizeVaults({
      indexerData,
      userAddress,
    })

    const isAllVaultsQuery = filterType === VAULTS_ALL
    const isPermissionedVaultsQuery = filterType === VAULTS_USER_DEPOSITOR

    setVaultsCtxState((prev) => ({
      ...prev,
      vaultsMapper: { ...prev.vaultsMapper, ...vaultsMapper },
      allVaultsIds: isAllVaultsQuery ? allVaultsIds : prev.allVaultsIds,
      permissionedVaultsIds:
        isAllVaultsQuery || isPermissionedVaultsQuery ? permissionedVaultsIds : prev.permissionedVaultsIds,
      myVaultsIds: isPermissionedVaultsQuery ? prev.myVaultsIds : myVaultsIds,
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
