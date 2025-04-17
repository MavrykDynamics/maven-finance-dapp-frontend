import { usePrevious } from 'react-use'
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'

// context
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useApolloContext } from 'providers/ApolloProvider/apollo.provider'
import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch'

// types
import {
  NullableVaultsCtxState,
  VaultsContext,
  VaultsDashboardDataType,
  VaultsSubsRecordType,
} from './vaults.provider.types'

// consts
import {
  GET_ALL_VAULTS_QUERY,
  GET_ALL_VAULTS_QUERY_COUNT,
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
  VAULTS_LIMIT,
  PAGINATION_ALL,
  PAGINATION_MY,
  PAGINATION_PERMISSIONED,
  PaginationVaultType,
} from './vaults.provider.consts'

// utils
import { normalizeVaults, normalizeVaultsNew } from './helpers/vaults.normalizer'
import { getVaultsProviderReturnValue } from './helpers/vaults.utils'
import { VaultStatsSchemaResponse } from './schemas/vaultsCount.schema'

export const vaultsContext = React.createContext<VaultsContext>(undefined!)

type Props = {
  children: React.ReactNode
}

// TODO: if will need implement query that will take vaults where owner === current user and market token === vault loan token
export const VaultsProvider = ({ children }: Props) => {
  const { userAddress } = useUserContext()
  const { handleApolloError } = useApolloContext()

  const prevUserAddress = usePrevious(userAddress)

  const [isLoading, setIsLoading] = useState(true)
  const [paginationState, setPaginationState] = useState(() => ({
    [PAGINATION_ALL]: 1,
    [PAGINATION_MY]: 1,
    [PAGINATION_PERMISSIONED]: 1,
  }))
  const [activeSubs, setActiveSubs] = useState<VaultsSubsRecordType>(DEFAULT_VAULTS_ACTIVE_SUBS)
  const [vaultsCtxState, setVaultsCtxState] = useState<NullableVaultsCtxState>(DEFAULT_VAULTS_CONTEXT)

  // reset user specific fields on user change
  useEffect(() => {
    if (prevUserAddress !== userAddress) {
      setVaultsCtxState((prev) => ({
        ...prev,
        permissionedVaultsIds: null,
        myVaultsIds: null,
      }))
    }
  }, [userAddress])

  /**
   * GET_USER_DEPOSITOR_ALL_VAULTS_QUERY -> get vaults where user allowed to deposit
   * GET_USER_ALL_VAULTS_QUERY -> get vaults created by user
   * GET_ALL_VAULTS_QUERY -> get all vaults
   */
  useQueryWithRefetch(GET_USER_DEPOSITOR_ALL_VAULTS_QUERY, {
    skip: !userAddress || activeSubs[VAULTS_DATA] !== VAULTS_USER_DEPOSITOR,
    variables: {
      userAddress: userAddress ?? '',
      limit: VAULTS_LIMIT,
      offset: (paginationState[PAGINATION_PERMISSIONED] - 1) * VAULTS_LIMIT,
    },
    onCompleted: (data) => {
      const { vaultsMapper, allVaultsIds, permissionedVaultsIds } = normalizeVaults({
        indexerData: data,
        userAddress,
      })

      setVaultsCtxState((prev) => ({
        ...prev,
        permissionedVaultsMapper: { ...prev.permissionedVaultsMapper, ...vaultsMapper },
        allVaultsIds: Array.from(new Set([...(prev.allVaultsIds ?? []), ...allVaultsIds])),
        permissionedVaultsIds,
      }))
      setIsLoading(false)
    },
    onError: (error) => handleApolloError(error, 'GET_USER_DEPOSITOR_ALL_VAULTS_QUERY'),
  })

  useQueryWithRefetch(GET_USER_ALL_VAULTS_QUERY, {
    skip: !userAddress || activeSubs[VAULTS_DATA] !== VAULTS_USER_ALL,
    variables: {
      userAddress: userAddress ?? '',
      limit: VAULTS_LIMIT,
      offset: (paginationState[PAGINATION_MY] - 1) * VAULTS_LIMIT,
    },
    onCompleted: (data) => {
      const { vaultsMapper, allVaultsIds, myVaultsIds } = normalizeVaults({
        indexerData: data,
        userAddress,
      })

      setVaultsCtxState((prev) => ({
        ...prev,
        myVaultsMapper: { ...prev.myVaultsMapper, ...vaultsMapper },
        allVaultsIds: Array.from(new Set([...(prev.allVaultsIds ?? []), ...allVaultsIds])),
        myVaultsIds,
      }))
      setIsLoading(false)
    },
    onError: (error) => handleApolloError(error, 'GET_USER_ALL_VAULTS_QUERY'),
  })

  useQueryWithRefetch(GET_ALL_VAULTS_QUERY, {
    skip: activeSubs[VAULTS_DATA] !== VAULTS_ALL,
    variables: {
      limit: VAULTS_LIMIT,
      offset: (paginationState[PAGINATION_ALL] - 1) * VAULTS_LIMIT,
    },
    onCompleted: (data) => {
      // update vaults logic to merge data, dont replace the existing one
      const { vaultsMapper, allVaultsIds, myVaultsIds, permissionedVaultsIds } = normalizeVaultsNew({
        indexerData: data,
        userAddress,
      })

      setVaultsCtxState((prev) => ({
        ...prev,
        vaultsMapper: { ...prev.vaultsMapper, ...vaultsMapper },
        allVaultsIds,
        permissionedVaultsIds,
        myVaultsIds,
      }))
      setIsLoading(false)
    },
    onError: (error) => handleApolloError(error, 'GET_ALL_VAULTS_QUERY'),
  })

  useQueryWithRefetch(GET_ALL_VAULTS_QUERY_COUNT, {
    variables: {},
    onCompleted: (data) => {
      const parsedData = VaultStatsSchemaResponse.safeParse(data)

      if (!parsedData.success) {
        console.error('Error parsing vaults count data:', parsedData.error)
        return
      }

      const totalCount = parsedData.data.totalVaults.aggregate.count
      const myVaultsCount = parsedData.data.userOpenVaults.nodes[0].vaults_aggregate.aggregate.count
      const permissionedVaultsCount =
        parsedData.data.otherOpenVaultsWithAllowance.nodes[0].vaults_aggregate.aggregate.count

      setVaultsCtxState((prev) => ({
        ...prev,
        vaultsPaginationStats: {
          total: totalCount,
          my: myVaultsCount,
          permissioned: permissionedVaultsCount,
        },
      }))
    },
    onError: (error) => handleApolloError(error, 'GET_ALL_VAULTS_QUERY_COUNT'),
  })

  const changePage = useCallback(
    (newPage: number, mapperType: PaginationVaultType) => {
      if (newPage === paginationState[mapperType]) return
      setIsLoading(true)
      setPaginationState((prev) => ({ ...prev, [mapperType]: newPage }))
    },
    [paginationState],
  )

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
        changePage,
        setIsLoading,
        isLoadingVaults: isLoading,
      }),
    [vaultsCtxState, activeSubs, isLoading, userAddress],
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
