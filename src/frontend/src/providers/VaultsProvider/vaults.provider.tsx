import { usePrevious } from 'react-use'
import React, { useContext, useEffect, useMemo, useState } from 'react'

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
    },
    onCompleted: (data) => {
      const { vaultsMapper, allVaultsIds, permissionedVaultsIds } = normalizeVaults({
        indexerData: data,
        userAddress,
      })

      setVaultsCtxState((prev) => ({
        ...prev,
        vaultsMapper: { ...prev.vaultsMapper, ...vaultsMapper },
        allVaultsIds: Array.from(new Set([...(prev.allVaultsIds ?? []), ...allVaultsIds])),
        permissionedVaultsIds,
      }))
    },
    onError: (error) => handleApolloError(error, 'GET_USER_DEPOSITOR_ALL_VAULTS_QUERY'),
  })

  useQueryWithRefetch(GET_USER_ALL_VAULTS_QUERY, {
    skip: !userAddress || activeSubs[VAULTS_DATA] !== VAULTS_USER_ALL,
    variables: {
      userAddress: userAddress ?? '',
    },
    onCompleted: (data) => {
      const { vaultsMapper, allVaultsIds, myVaultsIds } = normalizeVaults({
        indexerData: data,
        userAddress,
      })

      setVaultsCtxState((prev) => ({
        ...prev,
        vaultsMapper: { ...prev.vaultsMapper, ...vaultsMapper },
        allVaultsIds: Array.from(new Set([...(prev.allVaultsIds ?? []), ...allVaultsIds])),
        myVaultsIds,
      }))
    },
    onError: (error) => handleApolloError(error, 'GET_USER_ALL_VAULTS_QUERY'),
  })

  // andrew_here
  // it uses refetch logic every N blocks (for now 5 blocks)

  // TODO second important task (same goes for markets query(loan))
  // after u add pagination and it works, add filter case to fetch only updated queries

  // Example -> I fetch 10 vaults and got the last_updated_timestamp
  // the next time it do redetch -> use filter to fetch vaults after last_updated_timestamp, so it doesnt take old queries
  useQueryWithRefetch(GET_ALL_VAULTS_QUERY, {
    skip: activeSubs[VAULTS_DATA] !== VAULTS_ALL,
    variables: {}, // add offset & limit, update GET_ALL_VAULTS_QUERY to take limit and offset
    onCompleted: (data) => {
      // update vaults logic to merge data, dont replace the existing one
      const { vaultsMapper, allVaultsIds, myVaultsIds, permissionedVaultsIds } = normalizeVaults({
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
    },
    onError: (error) => handleApolloError(error, 'GET_ALL_VAULTS_QUERY'),
  })

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
