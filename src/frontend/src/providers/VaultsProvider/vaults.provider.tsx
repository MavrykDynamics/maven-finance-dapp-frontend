import { usePrevious } from 'react-use'
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'

// context
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useApolloContext } from 'providers/ApolloProvider/apollo.provider'
import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch'

// types
import {
  LendingQueryFilterType,
  NullableVaultsCtxState,
  VaultFiltersType,
  VaultsContext,
  VaultsDashboardDataType,
  VaultsSubsRecordType,
} from './vaults.provider.types'

// consts
import { GET_ALL_VAULTS_QUERY, GET_ALL_VAULTS_QUERY_COUNT } from './queries/vaults.query'
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
  VAULTS_DEFFAULT_FILTERS,
} from './vaults.provider.consts'

// utils
import { normalizeVaultsNew } from './helpers/vaults.normalizer'
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

  // used for the user active vaults based on the market address
  const [marketAddress, setMarketAddress] = useState<string | null>(null)

  // query filters
  const [vaultFilters, setVaultFilters] = useState<VaultFiltersType>(VAULTS_DEFFAULT_FILTERS)

  // used to disable buttons, filters etc. when pending query with updated filters
  const [isPendingQueryWhenFilters, setIsPendingQueryWhenFilters] = useState(true)

  const defaultVaultFilters = useMemo(
    () =>
      ({
        [PAGINATION_ALL]: {
          where: { is_open: { _eq: true }, ...vaultFilters[PAGINATION_ALL].where },
          orderBy: {
            creation_timestamp: 'desc',
            ...vaultFilters[PAGINATION_ALL].orderBy,
          },
          shadowWhere: { ...vaultFilters[PAGINATION_ALL].shadowWhere },
        },
        [PAGINATION_MY]: {
          where: {
            is_open: { _eq: true },
            owner_address: { _eq: userAddress !== null ? userAddress : undefined },
            ...(marketAddress
              ? {
                  loan_token_address: {
                    _eq: marketAddress,
                  },
                }
              : {}),
            ...vaultFilters[PAGINATION_MY].where,
          },
          orderBy: {
            creation_timestamp: 'desc',
            ...vaultFilters[PAGINATION_MY].orderBy,
          },
          shadowWhere: {
            ...vaultFilters[PAGINATION_MY].shadowWhere,
            owner: { address: { _eq: userAddress !== null ? userAddress : undefined } },
          },
        },
        [PAGINATION_PERMISSIONED]: {
          where: (() => {
            const { _or: searchOr, ...restWhere } = vaultFilters[PAGINATION_PERMISSIONED].where

            return {
              _and: [
                {
                  is_open: { _eq: true },
                  owner_address: { _neq: userAddress },
                  _or: [
                    { allowance: { _eq: '0' } },
                    {
                      _and: [
                        { allowance: { _eq: '1' } },
                        { depositors_json: { _contains: { address: { _eq: userAddress } } } },
                      ],
                    },
                  ],
                  ...restWhere,
                },
                {
                  _or: searchOr,
                },
              ],
            }
          })(),
          orderBy: {
            creation_timestamp: 'desc',
            ...vaultFilters[PAGINATION_PERMISSIONED].orderBy,
          },
          shadowWhere: { ...vaultFilters[PAGINATION_PERMISSIONED].shadowWhere },
        },
      } as VaultFiltersType),
    [marketAddress, userAddress, vaultFilters],
  )

  const updateVaultQueryFilters = useCallback(
    (queryFilters: Partial<LendingQueryFilterType>, vaultType: PaginationVaultType) => {
      setVaultFilters((prev) => ({ ...prev, [vaultType]: { ...prev[vaultType], ...queryFilters } }))
    },
    [],
  )

  const resetVaultFilters = useCallback(() => {
    setVaultFilters(VAULTS_DEFFAULT_FILTERS)
  }, [])

  // reset user specific fields on user change
  useEffect(() => {
    if (prevUserAddress !== userAddress) {
      setVaultsCtxState((prev) => ({
        ...prev,
        permissionedVaultsIds: null,
        myVaultsIds: null,
      }))
    }
  }, [userAddress, prevUserAddress])

  // if no user address we can query for user vaults ot permissioned vaults
  // so we reset the loading state in case user address is not set
  useEffect(() => {
    if (!userAddress && (isLoading || isPendingQueryWhenFilters)) {
      setIsLoading(false)
      setIsPendingQueryWhenFilters(false)
    }
  }, [isLoading, userAddress, isPendingQueryWhenFilters])

  // QUERY FOR PERMISSION VAULTS ( get vaults where user allowed to deposit)
  useQueryWithRefetch(GET_ALL_VAULTS_QUERY, {
    skip: !userAddress || activeSubs[VAULTS_DATA] !== VAULTS_USER_DEPOSITOR,
    variables: {
      limit: VAULTS_LIMIT,
      offset: (paginationState[PAGINATION_PERMISSIONED] - 1) * VAULTS_LIMIT,
      vaultsWhere: defaultVaultFilters[PAGINATION_PERMISSIONED].where,
      vaultsOrderBy: defaultVaultFilters[PAGINATION_PERMISSIONED].orderBy,
    },
    onCompleted: (data) => {
      const { vaultsMapper, vaultsIds } = normalizeVaultsNew({
        indexerData: data,
        userAddress,
      })

      setVaultsCtxState((prev) => ({
        ...prev,
        permissionedVaultsMapper: { ...vaultsMapper },
        permissionedVaultsIds: vaultsIds,
      }))
      setIsLoading(false)
      setIsPendingQueryWhenFilters(false)
    },
    onError: (error) => handleApolloError(error, 'GET_USER_DEPOSITOR_ALL_VAULTS_QUERY'),
  })

  // QUERY FOR USER VAULTS (MY)
  useQueryWithRefetch(GET_ALL_VAULTS_QUERY, {
    skip: !userAddress || activeSubs[VAULTS_DATA] !== VAULTS_USER_ALL,
    variables: {
      vaultsWhere: defaultVaultFilters[PAGINATION_MY].where,
      vaultsOrderBy: defaultVaultFilters[PAGINATION_MY].orderBy,
      limit: VAULTS_LIMIT,
      offset: (paginationState[PAGINATION_MY] - 1) * VAULTS_LIMIT,
    },
    onCompleted: (data) => {
      const { vaultsMapper, vaultsIds } = normalizeVaultsNew({
        indexerData: data,
        userAddress,
      })

      setVaultsCtxState((prev) => ({
        ...prev,
        myVaultsMapper: { ...vaultsMapper },
        myVaultsIds: vaultsIds,
      }))

      setIsLoading(false)
      setIsPendingQueryWhenFilters(false)
    },
    onError: (error) => handleApolloError(error, 'GET_USER_ALL_VAULTS_QUERY'),
  })

  // QUERY FOR ALL VAULTS
  useQueryWithRefetch(GET_ALL_VAULTS_QUERY, {
    skip: activeSubs[VAULTS_DATA] !== VAULTS_ALL,
    variables: {
      vaultsWhere: defaultVaultFilters[PAGINATION_ALL].where,
      vaultsOrderBy: defaultVaultFilters[PAGINATION_ALL].orderBy,
      limit: VAULTS_LIMIT,
      offset: (paginationState[PAGINATION_ALL] - 1) * VAULTS_LIMIT,
    },
    onCompleted: (data) => {
      const { vaultsMapper, vaultsIds } = normalizeVaultsNew({
        indexerData: data,
        userAddress,
      })

      setVaultsCtxState((prev) => ({
        ...prev,
        vaultsMapper: { ...vaultsMapper },
        allVaultsIds: vaultsIds,
      }))
      setIsLoading(false)
      setIsPendingQueryWhenFilters(false)
    },
    onError: (error) => handleApolloError(error, 'GET_ALL_VAULTS_QUERY'),
  })

  useQueryWithRefetch(GET_ALL_VAULTS_QUERY_COUNT, {
    variables: {
      totalCountWhere: defaultVaultFilters[PAGINATION_ALL].shadowWhere,
      userCountWhere: defaultVaultFilters[PAGINATION_MY].shadowWhere,
      permissionedCountWhere: defaultVaultFilters[PAGINATION_PERMISSIONED].shadowWhere,
    },
    onCompleted: (data) => {
      const parsedData = VaultStatsSchemaResponse.safeParse(data)

      if (!parsedData.success) {
        console.error('Error parsing vaults count data:', parsedData.error)
        return
      }

      const totalCount = parsedData.data.totalVaults[0].vaults_aggregate.aggregate.count
      const myVaultsCount = parsedData.data.userOpenVaults[0].vaults_aggregate.aggregate.count
      const permissionedVaultsCount = parsedData.data.otherOpenVaultsWithAllowance[0].vaults_aggregate.aggregate.count

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

  const changeUserVaultsQueryBasedOnMarket = useCallback((marketAddress: string | null) => {
    setMarketAddress(marketAddress)
  }, [])

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
    () => ({
      ...getVaultsProviderReturnValue({
        vaultsCtxState,
        activeSubs,
        changeVaultsSubscriptionsList,
        setVaultsDashboardData,
        userAddress,
        setIsLoading,
        isLoadingVaults: isLoading,
      }),
      updateVaultQueryFilters,
      resetVaultFilters,
      changePage,
      changeUserVaultsQueryBasedOnMarket,
      setIsPendingQueryWhenFilters,
      isPendingQueryWhenFilters,
    }),
    [
      vaultsCtxState,
      activeSubs,
      userAddress,
      isLoading,
      updateVaultQueryFilters,
      resetVaultFilters,
      changePage,
      changeUserVaultsQueryBasedOnMarket,
      isPendingQueryWhenFilters,
    ],
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
