import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'

// helpers
import { SATELLITE_AGGREGATE_COUNT, SATELLITE_DATA_QUERY } from './queries/satellites.query'
import { normalizeSatellitesLedger } from './helpers/satellites.normalizer'
import { getSatellitesProviderReturnValue } from './helpers/satellites.utils'

// consts
import {
  DEFAULT_SATELLITE_PAGINATION_DATA,
  DEFAULT_SATELLITES_ACTIVE_SUBS,
  DEFAULT_SATELLITES_CONTEXT,
  PaginationSatelliteType,
  SATELLITE_DATA_SUB,
  SATELLITE_DEFFAULT_FILTERS,
  SATELLITE_PAGINATION_ACTIVE,
  SATELLITE_PAGINATION_ALL,
  SATELLITE_PAGINATION_BY_ADDRESS,
  SATELLITE_PAGINATION_ORACLES,
  SATELLITE_PARTICIPATION_DATA_SUB,
  SATELLITES_DATA_ACTIVE_SUB,
  SATELLITES_DATA_ALL_SUB,
  SATELLITES_DATA_ORACLES_SUB,
  SATELLITES_DATA_SINGLE_SUB,
  SATELLITES_LIMIT,
} from './satellites.const'
import { SATELLITES_METRICS_DATA } from './queries/satellitesMetricsData.query'

// types
import {
  SatelliteFiltersType,
  SatelliteQueryFilterType,
  SatellitesContext,
  SatellitesContextState,
  SatellitesSubsRecordType,
} from './satellites.provider.types'

// hooks
import { useQueryProvider } from 'providers/QueryProvider/query.provider'
import { useGraphQLQuery } from 'providers/QueryProvider/useGraphQLQuery'
import {
  getSatelliteActiveFilters,
  getSatelliteAllFilters,
  getSatelliteByAddressFilters,
  getSatelliteOracleFilters,
} from './helpers/satellite.filters'
import { SatellitesCountsSchema } from './schemas/satellitesCount.schema'
import { mergeFilters } from 'utils/merge'
import {
  DappDataForSatelliteMetricsQuery,
  GetSatellitesCountQuery,
  Satellite_Data_View_Bool_Exp,
  Satellite_Data_View_Order_By,
  SatelliteDataQueryQuery,
} from 'utils/__generated__/graphql'
import { fetchAdditionalSatelliteData } from './helpers/satellite.fetcher'

export const satellitesContext = React.createContext<SatellitesContext>(undefined!)

export type Props = {
  children: React.ReactNode
}

export const SatellitesProvider = ({ children }: Props) => {
  const { handleQueryError } = useQueryProvider()

  const [satellitesCtxState, setSatellitesCtxState] =
    useState<DeepNullable<SatellitesContextState>>(DEFAULT_SATELLITES_CONTEXT)

  const [satelliteAddressToSubscribe, setSatelliteAddressToSubscribe] = useState<string | null>(null)
  const [activeSubs, setActiveSubs] = useState<SatellitesSubsRecordType>(DEFAULT_SATELLITES_ACTIVE_SUBS)

  // Pagination
  const [isLoading, setIsLoading] = useState(true)

  // Satellite filters --------------------
  const [paginationState, setPaginationState] = useState(() => DEFAULT_SATELLITE_PAGINATION_DATA)

  // query filters
  // @ts-ignore
  const [satelliteFilters, setSatelliteFilters] = useState<SatelliteFiltersType>(SATELLITE_DEFFAULT_FILTERS)

  const changeSatellitesSubscriptionsList = useCallback((newSkips: Partial<SatellitesSubsRecordType>) => {
    setActiveSubs((prev) => ({ ...prev, ...newSkips }))
  }, [])

  const changePage = useCallback(
    (newPage: number, mapperType: PaginationSatelliteType) => {
      if (newPage === paginationState[mapperType]) return
      setIsLoading(true)
      setPaginationState((prev) => ({ ...prev, [mapperType]: newPage }))
    },
    [paginationState],
  )

  const updateSatelliteQueryFilters = useCallback(
    (queryFilters: Partial<SatelliteQueryFilterType>, vaultType: PaginationSatelliteType) => {
      setIsLoading(true)
      setSatelliteFilters((prev) => ({ ...prev, [vaultType]: { ...prev[vaultType], ...queryFilters } }))
    },
    [],
  )

  const defaultSatelliteFilters = useMemo(
    () =>
      ({
        [SATELLITE_PAGINATION_ALL]: mergeFilters<
          Satellite_Data_View_Bool_Exp,
          Satellite_Data_View_Order_By,
          PaginationSatelliteType
        >(getSatelliteAllFilters, satelliteFilters, SATELLITE_PAGINATION_ALL),

        [SATELLITE_PAGINATION_BY_ADDRESS]: {
          ...getSatelliteByAddressFilters(satelliteAddressToSubscribe ?? ''),
        },

        [SATELLITE_PAGINATION_ACTIVE]: mergeFilters<
          Satellite_Data_View_Bool_Exp,
          Satellite_Data_View_Order_By,
          PaginationSatelliteType
        >(getSatelliteActiveFilters, satelliteFilters, SATELLITE_PAGINATION_ACTIVE),

        [SATELLITE_PAGINATION_ORACLES]: mergeFilters<
          Satellite_Data_View_Bool_Exp,
          Satellite_Data_View_Order_By,
          PaginationSatelliteType
        >(getSatelliteOracleFilters, satelliteFilters, SATELLITE_PAGINATION_ORACLES),
      } as unknown as SatelliteFiltersType),
    [satelliteAddressToSubscribe, satelliteFilters],
  )

  /**
   * SATELLITES_METRICS_DATA -> load proposals, finReqs, satelliteGov actions amount to calcs satellites metrics
   * SATELLITE_DATA_QUERY -> load satellite by address
   * ALL_SATELLITES_DATA_QUERY -> load all satellites
   * ACTIVE_SATELLITES_DATA_QUERY -> load all active satellites
   * ORACLES_SATELLITES_DATA_QUERY -> load all oracles satellites
   */
  useGraphQLQuery(SATELLITES_METRICS_DATA, {
    skip: !activeSubs[SATELLITE_PARTICIPATION_DATA_SUB],
    onCompleted: (data: DappDataForSatelliteMetricsQuery) => {
      setSatellitesCtxState((prev) => ({
        ...prev,
        proposalsAmount: data.governance_proposal_aggregate.aggregate?.count ?? 0,
        satelliteGovActionsAmount: data.governance_satellite_action_aggregate.aggregate?.count ?? 0,
        finRequestsAmount: data.governance_financial_request_aggregate.aggregate?.count ?? 0,
      }))
    },
    onError: (error) => handleQueryError(error, 'SATELLITES_METRICS_DATA'),
  })

  useGraphQLQuery(SATELLITE_DATA_QUERY, {
    skip: !satelliteAddressToSubscribe || !activeSubs[SATELLITES_DATA_SINGLE_SUB],
    variables: {
      ...defaultSatelliteFilters[SATELLITE_PAGINATION_BY_ADDRESS],
      satelliteWhere: defaultSatelliteFilters[SATELLITE_PAGINATION_BY_ADDRESS].where,
      satelliteOrderBy: defaultSatelliteFilters[SATELLITE_PAGINATION_BY_ADDRESS].orderBy,
      limit: SATELLITES_LIMIT,
      offset: (paginationState[SATELLITE_PAGINATION_BY_ADDRESS] - 1) * SATELLITES_LIMIT,
    },
    onCompleted: async (data: SatelliteDataQueryQuery) => {
      let additionalSatelliteData = null
      try {
        const satellitedIds = data.satellite.map((entry) => entry.user_address as string) || []
        additionalSatelliteData = await fetchAdditionalSatelliteData(satellitedIds)
      } catch (e) {
        console.error('fetchAdditionalSatelliteData error:', e)
      }

      const { satelliteIds, satelliteMapper } = normalizeSatellitesLedger(data, additionalSatelliteData)

      setSatellitesCtxState((prev) => ({
        ...prev,
        staelliteIdsByAddress: satelliteIds,
        satelliteMapperByAddress: satelliteMapper,
      }))

      setIsLoading(false)
    },
    onError: (error) => handleQueryError(error, 'SATELLITE_DATA_QUERY|SATELLITES_DATA_SINGLE_SUB'),
  })

  useGraphQLQuery(SATELLITE_DATA_QUERY, {
    skip: activeSubs[SATELLITE_DATA_SUB] !== SATELLITES_DATA_ALL_SUB,
    variables: {
      satelliteWhere: defaultSatelliteFilters[SATELLITE_PAGINATION_ALL].where,
      satelliteOrderBy: defaultSatelliteFilters[SATELLITE_PAGINATION_ALL].orderBy,
      limit: SATELLITES_LIMIT,
      offset: (paginationState[SATELLITE_PAGINATION_ALL] - 1) * SATELLITES_LIMIT,
    },
    onCompleted: async (data: SatelliteDataQueryQuery) => {
      let additionalSatelliteData = null
      try {
        const satellitedIds = data.satellite.map((entry) => entry.user_address as string) || []
        additionalSatelliteData = await fetchAdditionalSatelliteData(satellitedIds)
      } catch (e) {
        console.error('fetchAdditionalSatelliteData error:', e)
      }

      const { satelliteIds, satelliteMapper } = normalizeSatellitesLedger(data, additionalSatelliteData)

      setSatellitesCtxState((prev) => ({
        ...prev,
        satelliteMapper: satelliteMapper,
        allSatellitesIds: satelliteIds,
      }))

      setIsLoading(false)
    },
    onError: (error) => handleQueryError(error, 'ALL_SATELLITES_DATA_QUERY'),
  })

  useGraphQLQuery(SATELLITE_DATA_QUERY, {
    skip: activeSubs[SATELLITE_DATA_SUB] !== SATELLITES_DATA_ACTIVE_SUB,
    variables: {
      satelliteWhere: defaultSatelliteFilters[SATELLITE_PAGINATION_ACTIVE].where,
      satelliteOrderBy: defaultSatelliteFilters[SATELLITE_PAGINATION_ACTIVE].orderBy,
      limit: SATELLITES_LIMIT,
      offset: (paginationState[SATELLITE_PAGINATION_ACTIVE] - 1) * SATELLITES_LIMIT,
    },
    onCompleted: async (data: SatelliteDataQueryQuery) => {
      let additionalSatelliteData = null
      try {
        const satellitedIds = data.satellite.map((entry) => entry.user_address as string) || []
        additionalSatelliteData = await fetchAdditionalSatelliteData(satellitedIds)
      } catch (e) {
        console.error('fetchAdditionalSatelliteData error:', e)
      }

      const { satelliteIds, satelliteMapper } = normalizeSatellitesLedger(data, additionalSatelliteData)

      setSatellitesCtxState((prev) => ({
        ...prev,
        satelliteActiveMapper: satelliteMapper,
        activeSatellitesIds: satelliteIds,
      }))

      setIsLoading(false)
    },
    onError: (error) => handleQueryError(error, 'ACTIVE_SATELLITES_DATA_QUERY'),
  })

  useGraphQLQuery(SATELLITE_DATA_QUERY, {
    skip: activeSubs[SATELLITE_DATA_SUB] !== SATELLITES_DATA_ORACLES_SUB,
    variables: {
      satelliteWhere: defaultSatelliteFilters[SATELLITE_PAGINATION_ORACLES].where,
      satelliteOrderBy: defaultSatelliteFilters[SATELLITE_PAGINATION_ORACLES].orderBy,
      limit: SATELLITES_LIMIT,
      offset: (paginationState[SATELLITE_PAGINATION_ORACLES] - 1) * SATELLITES_LIMIT,
    },
    onCompleted: async (data: SatelliteDataQueryQuery) => {
      let additionalSatelliteData = null
      try {
        const satellitedIds = data.satellite.map((entry) => entry.user_address as string) || []
        additionalSatelliteData = await fetchAdditionalSatelliteData(satellitedIds)
      } catch (e) {
        console.error('fetchAdditionalSatelliteData error:', e)
      }

      const { satelliteIds, satelliteMapper } = normalizeSatellitesLedger(data, additionalSatelliteData)

      setSatellitesCtxState((prev) => ({
        ...prev,
        oraclesIds: satelliteIds,
        satelliteOraclesMapper: satelliteMapper,
      }))
      setIsLoading(false)
    },
    onError: (error) => handleQueryError(error, 'ORACLES_SATELLITES_DATA_QUERY'),
  })

  useGraphQLQuery(SATELLITE_AGGREGATE_COUNT, {
    variables: {
      whereBySatelliteTotal: defaultSatelliteFilters[SATELLITE_PAGINATION_ALL].shadowWhere,
      whereBysatelliteAddress: defaultSatelliteFilters[SATELLITE_PAGINATION_BY_ADDRESS].shadowWhere,
      whereByActiveSatellite: defaultSatelliteFilters[SATELLITE_PAGINATION_ACTIVE].shadowWhere,
      whereOracles: defaultSatelliteFilters[SATELLITE_PAGINATION_ORACLES].shadowWhere,
    },
    onCompleted: (data: GetSatellitesCountQuery) => {
      try {
        const parsedData = SatellitesCountsSchema.parse(data)
        const {
          totalSatellites: {
            aggregate: { count: totalCount },
          },
          userSatellites: {
            aggregate: { count: userSatellitesCount },
          },
          activeSatellites: {
            aggregate: { count: activeSatellitesCount },
          },
          oracleSatellites: {
            aggregate: { count: oracleSatellitesCount },
          },
        } = parsedData ?? {}

        setSatellitesCtxState((prev) => ({
          ...prev,
          totalSatellitesCount: totalCount ?? 0,
          activeSatellitesCount: activeSatellitesCount ?? 0,
          userSatellitesCount: userSatellitesCount ?? 0,
          oracleSatellitesCount: oracleSatellitesCount ?? 0,
        }))
      } catch (error) {
        console.error(error, 'SATELLITE_AGGREGATE_COUNT')
      }
    },
    onError: (error) => handleQueryError(error, 'SATELLITE_AGGREGATE_COUNT'),
  })

  const providerValue = useMemo(
    () => ({
      ...getSatellitesProviderReturnValue({
        satellitesCtxState,
        satelliteAddressToSubscribe,
        activeSubs,
        changeSatellitesSubscriptionsList,
        setSatelliteAddressToSubscribe,
        isPaginationLoading: isLoading,
      }),
      changePage,
      updateSatelliteQueryFilters,
      paginationState,
    }),
    [
      satellitesCtxState,
      updateSatelliteQueryFilters,
      satelliteAddressToSubscribe,
      activeSubs,
      isLoading,
      changePage,
      paginationState,
    ],
  )

  return <satellitesContext.Provider value={providerValue}>{children}</satellitesContext.Provider>
}

export const useSatellitesContext = () => {
  const context = useContext(satellitesContext)

  if (!context) {
    throw new Error('satellitesContext should be used withing SatellitesProvider')
  }

  return context
}

export default SatellitesProvider
