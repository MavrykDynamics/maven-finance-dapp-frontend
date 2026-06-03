import { usePrevious } from 'react-use'
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'

// context
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useQueryProvider } from 'providers/QueryProvider/query.provider'
import { useGraphQLQuery } from 'providers/QueryProvider/useGraphQLQuery'

// types
import {
  LendingQueryFilterType,
  NullableVaultsCtxState,
  VaultFiltersType,
  VaultType,
  VaultsContext,
  VaultsDashboardDataType,
  VaultsSubsRecordType,
} from './vaults.provider.types'
import { Order_By } from 'utils/__generated__/graphql'

// queries
import { GET_ALL_VAULTS_QUERY_COUNT } from './queries/vaults.query'
import { GET_VAULTS_LIST_QUERY } from './queries/vaultsList.query'
import { GET_VAULTS_COLLATERAL_BULK_QUERY } from './queries/vaultsCollateral.query'
import { GET_VAULTS_DEPOSITORS_QUERY } from './queries/vaultsDepositors.query'

// consts
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
import {
  buildDepositorsByVaultId,
  mergeCollateral,
  normalizeBaseList,
} from './helpers/vaults.normalizer'
import { getVaultsProviderReturnValue } from './helpers/vaults.utils'
import { VaultStatsSchemaResponse } from './schemas/vaultsCount.schema'

export const vaultsContext = React.createContext<VaultsContext>(undefined!)

type Props = {
  children: React.ReactNode
}

type ActiveMapperKey = 'vaultsMapper' | 'myVaultsMapper' | 'permissionedVaultsMapper'
type ActiveIdsKey = 'allVaultsIds' | 'myVaultsIds' | 'permissionedVaultsIds'

const subToMapperKey: Record<string, { mapperKey: ActiveMapperKey; idsKey: ActiveIdsKey }> = {
  [VAULTS_ALL]: { mapperKey: 'vaultsMapper', idsKey: 'allVaultsIds' },
  [VAULTS_USER_ALL]: { mapperKey: 'myVaultsMapper', idsKey: 'myVaultsIds' },
  [VAULTS_USER_DEPOSITOR]: { mapperKey: 'permissionedVaultsMapper', idsKey: 'permissionedVaultsIds' },
}

export const VaultsProvider = ({ children }: Props) => {
  const { userAddress } = useUserContext()
  const { handleQueryError } = useQueryProvider()

  const prevUserAddress = usePrevious(userAddress)

  const [isLoading, setIsLoading] = useState(false)
  const [paginationState, setPaginationState] = useState(() => ({
    [PAGINATION_ALL]: 1,
    [PAGINATION_MY]: 1,
    [PAGINATION_PERMISSIONED]: 1,
  }))
  const [activeSubs, setActiveSubs] = useState<VaultsSubsRecordType>(DEFAULT_VAULTS_ACTIVE_SUBS)
  const [vaultsCtxState, setVaultsCtxState] = useState<NullableVaultsCtxState>(DEFAULT_VAULTS_CONTEXT)

  // Depositors are fetched once (table is tiny — 7 rows) and indexed by vault id.
  // staleTime: Infinity is intentional; new depositors are rare and a manual
  // refresh on action completion is the right invalidation signal.
  const [depositorsByVaultId, setDepositorsByVaultId] = useState<Record<number, string[]>>({})

  // Bulk collateral query is chained off whichever list query is active.
  // Only one tab's list is in flight at a time (per `activeSubs[VAULTS_DATA]`),
  // so a single set of activeVaultIntIds + intIdByAddress is enough.
  // activeMapperKey is state (not ref) so the merge useEffect re-runs when
  // switching tabs — important because the collateral query often returns a
  // cache hit (same vault IDs across tabs for the same user), in which case
  // its onCompleted wouldn't fire and the new tab's mapper would stay
  // collateral-less.
  const [activeVaultIntIds, setActiveVaultIntIds] = useState<number[]>([])
  const [activeIntIdByAddress, setActiveIntIdByAddress] = useState<Record<string, number>>({})
  const [activeMapperKey, setActiveMapperKey] = useState<ActiveMapperKey | null>(null)

  // used for the user active vaults based on the market address
  const [marketAddress, setMarketAddress] = useState<string | null>(null)

  // query filters
  const [vaultFilters, setVaultFilters] = useState<VaultFiltersType>(VAULTS_DEFFAULT_FILTERS)

  // used to disable buttons, filters etc. when pending query with updated filters
  const [isPendingQueryWhenFilters, setIsPendingQueryWhenFilters] = useState(false)

  const preparedUserAddressForQuery = useMemo(() => (userAddress !== null ? userAddress : undefined), [userAddress])

  // All filter `where` clauses now target `lending_controller_vault` directly.
  // Default ordering is `id desc` (autoincrement, indexed PK) — equivalent to
  // creation_timestamp desc for "newest first", but 44× faster than the
  // relationship-based ordering Hasura translates for `vault.creation_timestamp`.
  const defaultVaultFilters = useMemo(
    () =>
      ({
        [PAGINATION_ALL]: {
          where: { open: { _eq: true }, ...vaultFilters[PAGINATION_ALL].where },
          orderBy: { id: Order_By.Desc, ...vaultFilters[PAGINATION_ALL].orderBy },
          shadowWhere: { ...vaultFilters[PAGINATION_ALL].shadowWhere },
        },
        [PAGINATION_MY]: {
          where: {
            open: { _eq: true },
            owner: { address: { _eq: preparedUserAddressForQuery } },
            ...(marketAddress
              ? { loan_token: { token: { token_address: { _eq: marketAddress } } } }
              : {}),
            ...vaultFilters[PAGINATION_MY].where,
          },
          orderBy: { id: Order_By.Desc, ...vaultFilters[PAGINATION_MY].orderBy },
          shadowWhere: {
            ...vaultFilters[PAGINATION_MY].shadowWhere,
            owner: { address: { _eq: preparedUserAddressForQuery } },
          },
        },
        [PAGINATION_PERMISSIONED]: {
          where: (() => {
            const { _or: searchOr, ...restWhere } = vaultFilters[PAGINATION_PERMISSIONED].where as any
            return {
              _and: [
                {
                  open: { _eq: true },
                  owner: { address: { _neq: preparedUserAddressForQuery } },
                  vault: {
                    _or: [
                      { allowance: { _eq: 0 } },
                      {
                        _and: {
                          allowance: { _eq: 1 },
                          depositors: { depositor: { address: { _eq: preparedUserAddressForQuery } } },
                        },
                      },
                    ],
                  },
                  ...restWhere,
                },
                ...(searchOr ? [{ _or: searchOr }] : []),
              ],
            }
          })(),
          orderBy: { id: Order_By.Desc, ...vaultFilters[PAGINATION_PERMISSIONED].orderBy },
          shadowWhere: {
            open: { _eq: true },
            vault: {
              _or: [
                { allowance: { _eq: '0' } },
                {
                  _and: {
                    depositors: { depositor: { address: { _eq: preparedUserAddressForQuery } } },
                    allowance: { _eq: '1' },
                  },
                },
              ],
            },
            owner: { address: { _neq: preparedUserAddressForQuery } },
            ...vaultFilters[PAGINATION_PERMISSIONED].shadowWhere,
          },
        },
      } as VaultFiltersType),
    [marketAddress, preparedUserAddressForQuery, vaultFilters],
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

  // ---- Depositors cache (loads once on first vault subscription) ----
  useGraphQLQuery(GET_VAULTS_DEPOSITORS_QUERY, {
    skip: activeSubs[VAULTS_DATA] === null,
    staleTime: Infinity,
    onCompleted: (data: any) => {
      setDepositorsByVaultId(buildDepositorsByVaultId(data?.vault_depositor ?? []))
    },
    onError: (error) => handleQueryError(error, 'GET_VAULTS_DEPOSITORS_QUERY'),
  })

  // Shared callback to handle list query completion for any tab.
  const handleListCompleted = useCallback(
    (subKey: typeof VAULTS_ALL | typeof VAULTS_USER_ALL | typeof VAULTS_USER_DEPOSITOR) => (data: any) => {
      const { mapperKey } = subToMapperKey[subKey]
      const { vaultsMapper, vaultsIds, vaultIntIds, intIdByAddress } = normalizeBaseList({
        indexerData: data,
        depositorsByVaultId,
      })

      setActiveMapperKey(mapperKey)
      setActiveIntIdByAddress(intIdByAddress)
      setActiveVaultIntIds(vaultIntIds)

      setVaultsCtxState((prev) => {
        const next = { ...prev }
        next[mapperKey] = { ...vaultsMapper }
        if (subKey === VAULTS_ALL) next.allVaultsIds = vaultsIds
        if (subKey === VAULTS_USER_ALL) next.myVaultsIds = vaultsIds
        if (subKey === VAULTS_USER_DEPOSITOR) next.permissionedVaultsIds = vaultsIds
        return next
      })

      setIsLoading(false)
      setIsPendingQueryWhenFilters(false)
    },
    [depositorsByVaultId],
  )

  // QUERY FOR PERMISSION VAULTS (where user is allowed to deposit)
  const permissionedQuery = useGraphQLQuery(GET_VAULTS_LIST_QUERY, {
    skip: !userAddress || activeSubs[VAULTS_DATA] !== VAULTS_USER_DEPOSITOR,
    staleTime: 60_000,
    variables: {
      where: defaultVaultFilters[PAGINATION_PERMISSIONED].where,
      orderBy: defaultVaultFilters[PAGINATION_PERMISSIONED].orderBy,
      limit: VAULTS_LIMIT,
      offset: (paginationState[PAGINATION_PERMISSIONED] - 1) * VAULTS_LIMIT,
    },
    onCompleted: handleListCompleted(VAULTS_USER_DEPOSITOR),
    onError: (error) => {
      handleQueryError(error, 'GET_USER_DEPOSITOR_VAULTS_LIST')
      setIsLoading(false)
      setIsPendingQueryWhenFilters(false)
    },
  })

  // QUERY FOR USER VAULTS (MY)
  const myQuery = useGraphQLQuery(GET_VAULTS_LIST_QUERY, {
    skip: !userAddress || activeSubs[VAULTS_DATA] !== VAULTS_USER_ALL,
    staleTime: 60_000,
    variables: {
      where: defaultVaultFilters[PAGINATION_MY].where,
      orderBy: defaultVaultFilters[PAGINATION_MY].orderBy,
      limit: VAULTS_LIMIT,
      offset: (paginationState[PAGINATION_MY] - 1) * VAULTS_LIMIT,
    },
    onCompleted: handleListCompleted(VAULTS_USER_ALL),
    onError: (error) => {
      handleQueryError(error, 'GET_USER_VAULTS_LIST')
      setIsLoading(false)
      setIsPendingQueryWhenFilters(false)
    },
  })

  // QUERY FOR ALL VAULTS
  const allQuery = useGraphQLQuery(GET_VAULTS_LIST_QUERY, {
    skip: activeSubs[VAULTS_DATA] !== VAULTS_ALL,
    staleTime: 60_000,
    variables: {
      where: defaultVaultFilters[PAGINATION_ALL].where,
      orderBy: defaultVaultFilters[PAGINATION_ALL].orderBy,
      limit: VAULTS_LIMIT,
      offset: (paginationState[PAGINATION_ALL] - 1) * VAULTS_LIMIT,
    },
    onCompleted: handleListCompleted(VAULTS_ALL),
    onError: (error) => {
      handleQueryError(error, 'GET_ALL_VAULTS_LIST')
      setIsLoading(false)
      setIsPendingQueryWhenFilters(false)
    },
  })

  // Reset isPendingQueryWhenFilters whenever the active tab's query is settled.
  // The filter component sets isPendingQueryWhenFilters=true on initial auto-apply
  // and on every filter change. The onCompleted handler resets it when new data
  // arrives — but if the filter change produces a query-key identical to the cached
  // one (e.g., default filters), TanStack returns cached data without re-fetching
  // and onCompleted does not fire. Without this reset, the page is stuck on
  // "Loading vaults" forever even though data is loaded. The dep array includes
  // both flags so the reset runs even when the filter component flips the flag
  // true *after* the query already settled.
  const isAnyFetching = allQuery.isFetching || myQuery.isFetching || permissionedQuery.isFetching
  useEffect(() => {
    if (!isAnyFetching && isPendingQueryWhenFilters) setIsPendingQueryWhenFilters(false)
  }, [isAnyFetching, isPendingQueryWhenFilters])

  // ---- Bulk collateral lookup chained off whichever list query just returned ----
  // Fires automatically when activeVaultIntIds changes. ~310ms in production vs
  // 26s for nested-relationship collateral through the broken view.
  // NOTE: We do NOT use onCompleted to drive the merge. When switching tabs,
  // the same vault IDs are common (a user's permissioned set often overlaps
  // with allVaults), so TanStack Query returns a cache hit — same data
  // reference, onCompleted skips. The useEffect below merges on every change
  // of `collateralData` / `activeMapperKey` / `activeIntIdByAddress`, which
  // correctly handles both fresh fetches and cache hits.
  const { data: collateralData } = useGraphQLQuery(GET_VAULTS_COLLATERAL_BULK_QUERY, {
    skip: activeVaultIntIds.length === 0,
    staleTime: 60_000,
    variables: { vaultIds: activeVaultIntIds },
    onError: (error) => handleQueryError(error, 'GET_VAULTS_COLLATERAL_BULK'),
  })

  useEffect(() => {
    if (!collateralData || !activeMapperKey) return
    const rows = (collateralData as any)?.lending_controller_vault_collateral_balance ?? []
    setVaultsCtxState((prev) => {
      const currentMapper = prev[activeMapperKey]
      if (!currentMapper) return prev
      return {
        ...prev,
        [activeMapperKey]: mergeCollateral(
          currentMapper as Record<string, VaultType>,
          rows,
          activeIntIdByAddress,
        ),
      }
    })
  }, [collateralData, activeMapperKey, activeIntIdByAddress])

  useGraphQLQuery(GET_ALL_VAULTS_QUERY_COUNT, {
    skip: activeSubs[VAULTS_DATA] === null,
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
    onError: (error) => handleQueryError(error, 'GET_ALL_VAULTS_QUERY_COUNT'),
  })

  const changePage = useCallback(
    (newPage: number, mapperType: PaginationVaultType) => {
      if (newPage === paginationState[mapperType]) return
      setPaginationState((prev) => ({ ...prev, [mapperType]: newPage }))
    },
    [paginationState],
  )

  const changeUserVaultsQueryBasedOnMarket = useCallback((marketAddress: string | null) => {
    setMarketAddress(marketAddress)
  }, [])

  const setVaultsDashboardData = useCallback((newVaultsDashboardData: VaultsDashboardDataType) => {
    setVaultsCtxState((prev) => ({
      ...prev,
      vaultsDashboardData: newVaultsDashboardData,
    }))
  }, [])

  const changeVaultsSubscriptionsList = useCallback((newSkips: Partial<VaultsSubsRecordType>) => {
    setActiveSubs((prev) => ({ ...prev, ...newSkips }))
  }, [])

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
