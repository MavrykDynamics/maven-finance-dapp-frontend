import React, { useCallback, useContext, useMemo, useState } from 'react'

// helpers
import {
  ACTIVE_SATELLITES_DATA_QUERY,
  ALL_SATELLITES_DATA_QUERY,
  ORACLES_SATELLITES_DATA_QUERY,
  SATELLITE_AGGREGATE_COUNT,
  SATELLITE_DATA_QUERY,
} from './queries/satellites.query'
import { normalizeSatellitesLedger } from './helpers/satellites.normalizer'
import { getSatellitesProviderReturnValue } from './helpers/satellites.utils'

// consts
import {
  DEFAULT_SATELLITES_ACTIVE_SUBS,
  DEFAULT_SATELLITES_CONTEXT,
  SATELLITE_DATA_SUB,
  SATELLITE_PARTICIPATION_DATA_SUB,
  SATELLITES_DATA_ACTIVE_SUB,
  SATELLITES_DATA_ALL_SUB,
  SATELLITES_DATA_ORACLES_SUB,
  SATELLITES_DATA_SINGLE_SUB,
  SATELLITES_LIMIT,
} from './satellites.const'
import { SATELLITES_METRICS_DATA } from './queries/satellitesMetricsData.query'

// types
import { SatellitesContext, SatellitesContextState, SatellitesSubsRecordType } from './satellites.provider.types'

// hooks
import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch'
import { useApolloContext } from 'providers/ApolloProvider/apollo.provider'

export const satellitesContext = React.createContext<SatellitesContext>(undefined!)

export type Props = {
  children: React.ReactNode
}

/**
 * NOTES:
 *
 * Single satellite sub: need to use SATELLITES_DATA_SINGLE_SUB sub type along with providing satellite address
 * via setSatelliteAddressToSubscribe, if this address is from indexer (userAddress, when isSatelliteTrue, or satelliteDelegatedTo)
 * you don't need to check whether satellite exists, if address can be modified by user, or we not sure whether satellite exists, we need to check it first
 * with apolloClient and CHECK_WHETHER_SATELLITE_EXISTS query, otherwise if satellite is not exists it will show infinity loader
 */
export const SatellitesProvider = ({ children }: Props) => {
  const { handleApolloError } = useApolloContext()

  const [satellitesCtxState, setSatellitesCtxState] =
    useState<DeepNullable<SatellitesContextState>>(DEFAULT_SATELLITES_CONTEXT)

  const [satelliteAddressToSubscribe, setSatelliteAddressToSubscribe] = useState<string | null>(null)
  const [activeSubs, setActiveSubs] = useState<SatellitesSubsRecordType>(DEFAULT_SATELLITES_ACTIVE_SUBS)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  /**
   * SATELLITES_METRICS_DATA -> load proposals, finReqs, satelliteGov actions amount to calcs satellites metrics
   * SATELLITE_DATA_QUERY -> load satellite by address
   * ALL_SATELLITES_DATA_QUERY -> load all satellites
   * ACTIVE_SATELLITES_DATA_QUERY -> load all active satellites
   * ORACLES_SATELLITES_DATA_QUERY -> load all oracles satellites
   */
  useQueryWithRefetch(SATELLITES_METRICS_DATA, {
    skip: !activeSubs[SATELLITE_PARTICIPATION_DATA_SUB],
    onCompleted: (data) => {
      setSatellitesCtxState((prev) => ({
        ...prev,
        proposalsAmount: data.governance_proposal_aggregate.aggregate?.count ?? 0,
        satelliteGovActionsAmount: data.governance_satellite_action_aggregate.aggregate?.count ?? 0,
        finRequestsAmount: data.governance_financial_request_aggregate.aggregate?.count ?? 0,
      }))
    },
    onError: (error) => handleApolloError(error, 'SATELLITES_METRICS_DATA'),
  })

  useQueryWithRefetch(SATELLITE_DATA_QUERY, {
    skip: !satelliteAddressToSubscribe || activeSubs[SATELLITE_DATA_SUB] !== SATELLITES_DATA_SINGLE_SUB,
    variables: {
      userAddress: satelliteAddressToSubscribe ?? '',
      limit: SATELLITES_LIMIT,
      offset: (currentPage - 1) * SATELLITES_LIMIT,
    },
    onCompleted: (data) => {
      const { oraclesIds, activeSatellitesIds, satelliteMapper } = normalizeSatellitesLedger(data)

      setSatellitesCtxState((prev) => ({
        ...prev,
        satelliteMapper: satelliteAddressToSubscribe
          ? { ...prev.satelliteMapper, ...satelliteMapper }
          : satelliteMapper,
        allSatellitesIds: data.satelliteAddresses.nodes.map(({ user: { address } }) => address),
        activeSatellitesIds: Array.from(new Set([...(prev.activeSatellitesIds ?? []), ...activeSatellitesIds])),
        oraclesIds: Array.from(new Set([...(prev.oraclesIds ?? []), ...oraclesIds])),
      }))
    },
    onError: (error) => handleApolloError(error, 'SATELLITE_DATA_QUERY'),
  })

  useQueryWithRefetch(ALL_SATELLITES_DATA_QUERY, {
    skip: activeSubs[SATELLITE_DATA_SUB] !== SATELLITES_DATA_ALL_SUB,
    fetchPolicy: 'network-only',
    variables: { limit: SATELLITES_LIMIT, offset: (currentPage - 1) * SATELLITES_LIMIT },
    onCompleted: (data) => {
      const { oraclesIds, activeSatellitesIds, satelliteMapper } = normalizeSatellitesLedger(data)

      setSatellitesCtxState((prev) => ({
        ...prev,
        satelliteMapper,
        allSatellitesIds: data.satelliteAddresses.nodes.map(({ user: { address } }) => address),
        activeSatellitesIds,
        oraclesIds,
      }))

      setIsLoading(false)
    },
    onError: (error) => handleApolloError(error, 'ALL_SATELLITES_DATA_QUERY'),
  })

  useQueryWithRefetch(ACTIVE_SATELLITES_DATA_QUERY, {
    skip: activeSubs[SATELLITE_DATA_SUB] !== SATELLITES_DATA_ACTIVE_SUB,
    variables: { limit: SATELLITES_LIMIT, offset: (currentPage - 1) * SATELLITES_LIMIT },
    onCompleted: (data) => {
      const { oraclesIds, activeSatellitesIds, satelliteMapper } = normalizeSatellitesLedger(data)

      setSatellitesCtxState((prev) => ({
        ...prev,
        satelliteMapper: { ...prev.satelliteMapper, ...satelliteMapper },
        allSatellitesIds: data.satelliteAddresses.nodes.map(({ user: { address } }) => address),
        activeSatellitesIds: activeSatellitesIds,
        oraclesIds: Array.from(new Set([...(prev.oraclesIds ?? []), ...oraclesIds])),
      }))
    },
    onError: (error) => handleApolloError(error, 'ACTIVE_SATELLITES_DATA_QUERY'),
  })

  useQueryWithRefetch(ORACLES_SATELLITES_DATA_QUERY, {
    skip: activeSubs[SATELLITE_DATA_SUB] !== SATELLITES_DATA_ORACLES_SUB,
    variables: { limit: SATELLITES_LIMIT, offset: (currentPage - 1) * SATELLITES_LIMIT },
    onCompleted: (data) => {
      const { oraclesIds, activeSatellitesIds, satelliteMapper } = normalizeSatellitesLedger(data)

      setSatellitesCtxState((prev) => ({
        ...prev,
        satelliteMapper: { ...prev.satelliteMapper, ...satelliteMapper },
        allSatellitesIds: data.satelliteAddresses.nodes.map(({ user: { address } }) => address),
        oraclesIds,
        activeSatellitesIds: Array.from(new Set([...(prev.activeSatellitesIds ?? []), ...activeSatellitesIds])),
      }))
    },
    onError: (error) => handleApolloError(error, 'ORACLES_SATELLITES_DATA_QUERY'),
  })

  useQueryWithRefetch(SATELLITE_AGGREGATE_COUNT, {
    skip: activeSubs[SATELLITE_DATA_SUB] !== SATELLITES_DATA_ALL_SUB,
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      const {
        satellite_aggregate: {
          // @ts-expect-error // for some reason TS doesn't see aggregate type
          aggregate: { count },
        },
      } = data ?? {}
      setSatellitesCtxState((prev) => ({
        ...prev,
        totalSatellitesCount: count ?? 0,
      }))
    },
    onError: (error) => handleApolloError(error, 'SATELLITE_AGGREGATE_COUNT'),
  })

  const changeSatellitesSubscriptionsList = (newSkips: Partial<SatellitesSubsRecordType>) => {
    setActiveSubs((prev) => ({ ...prev, ...newSkips }))
  }

  const changePage = useCallback(
    (newPage: number) => {
      if (newPage === currentPage) return
      setIsLoading(true)
      setCurrentPage(newPage)
    },
    [currentPage],
  )

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
    }),
    [satellitesCtxState, satelliteAddressToSubscribe, activeSubs, isLoading, changePage],
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
