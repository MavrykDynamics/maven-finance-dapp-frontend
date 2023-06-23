import { useSubscription } from '@apollo/client'

import { useState, useMemo } from 'react'
import {
  CONTRACT_STATUSES_FARM_SUB,
  CONTRACT_STATUSES_FARM_FACTORY_SUB,
  CONTRACT_STATUSES_TREASURY_SUB,
  CONTRACT_STATUSES_TREASURY_FACTORY_SUB,
  CONTRACT_STATUSES_AGGREGATOR_SUB,
  CONTRACT_STATUSES_AGGREGATOR_FACTORY_SUB,
  CONTRACT_STATUSES_DELEGATION_SUB,
  CONTRACT_STATUSES_DOORMAN_SUB,
} from '../queries/contractStatuses.query'
import { ContractStatusesType } from '../contractStatuses.types'
import { normalizeContractStatuses } from '../helpers/normalizeContractStatuses'

function checkStorageProperties(storage: Partial<ContractStatusesType>): storage is ContractStatusesType {
  return (
    storage.hasOwnProperty('farm') &&
    storage.hasOwnProperty('farm_factory') &&
    storage.hasOwnProperty('treasury') &&
    storage.hasOwnProperty('treasury_factory') &&
    storage.hasOwnProperty('aggregator') &&
    storage.hasOwnProperty('aggregator_factory') &&
    storage.hasOwnProperty('delegation') &&
    storage.hasOwnProperty('doorman')
  )
}

/**
 * not using context, cuz it's used only on 1 page, so context is not needed for that data
 * @returns contract statuses arr and initial loading flag
 */
export const useContactStatuses = () => {
  const [indexerContractStatuses, setIndexerContractStatuses] = useState<Partial<ContractStatusesType>>({})

  const { loading: farmLoading } = useSubscription(CONTRACT_STATUSES_FARM_SUB, {
    onData: ({ data: response }) => {
      const { data } = response
      if (data) setIndexerContractStatuses((prevStorage) => ({ ...prevStorage, farm: data.farm }))
    },
  })

  const { loading: farmFactoryLoading } = useSubscription(CONTRACT_STATUSES_FARM_FACTORY_SUB, {
    onData: ({ data: response }) => {
      const { data } = response
      if (data) setIndexerContractStatuses((prevStorage) => ({ ...prevStorage, farm_factory: data.farm_factory }))
    },
  })

  const { loading: treasuryLoading } = useSubscription(CONTRACT_STATUSES_TREASURY_SUB, {
    onData: ({ data: response }) => {
      const { data } = response
      if (data) setIndexerContractStatuses((prevStorage) => ({ ...prevStorage, treasury: data.treasury }))
    },
  })

  const { loading: treasuryFactoryLoading } = useSubscription(CONTRACT_STATUSES_TREASURY_FACTORY_SUB, {
    onData: ({ data: response }) => {
      const { data } = response
      if (data)
        setIndexerContractStatuses((prevStorage) => ({ ...prevStorage, treasury_factory: data.treasury_factory }))
    },
  })

  const { loading: aggregatorLoading } = useSubscription(CONTRACT_STATUSES_AGGREGATOR_SUB, {
    onData: ({ data: response }) => {
      const { data } = response
      if (data) setIndexerContractStatuses((prevStorage) => ({ ...prevStorage, aggregator: data.aggregator }))
    },
  })

  const { loading: aggregatorFactoryLoading } = useSubscription(CONTRACT_STATUSES_AGGREGATOR_FACTORY_SUB, {
    onData: ({ data: response }) => {
      const { data } = response
      if (data)
        setIndexerContractStatuses((prevStorage) => ({ ...prevStorage, aggregator_factory: data.aggregator_factory }))
    },
  })

  const { loading: delegationLoading } = useSubscription(CONTRACT_STATUSES_DELEGATION_SUB, {
    onData: ({ data: response }) => {
      const { data } = response
      if (data) setIndexerContractStatuses((prevStorage) => ({ ...prevStorage, delegation: data.delegation }))
    },
  })

  const { loading: doormanLoading } = useSubscription(CONTRACT_STATUSES_DOORMAN_SUB, {
    onData: ({ data: response }) => {
      const { data } = response
      if (data) setIndexerContractStatuses((prevStorage) => ({ ...prevStorage, doorman: data.doorman }))
    },
  })

  const isAllStatusesLoaded =
    !farmLoading &&
    !farmFactoryLoading &&
    !treasuryLoading &&
    !treasuryFactoryLoading &&
    !aggregatorLoading &&
    !aggregatorFactoryLoading &&
    !delegationLoading &&
    !doormanLoading

  const contractStatuses = useMemo(() => {
    if (isAllStatusesLoaded && checkStorageProperties(indexerContractStatuses))
      return normalizeContractStatuses(indexerContractStatuses)
    return []
  }, [isAllStatusesLoaded, indexerContractStatuses])

  return { isLoading: !isAllStatusesLoaded, contractStatuses }
}
