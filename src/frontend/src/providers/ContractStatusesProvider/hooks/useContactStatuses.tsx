import { useSubscription } from '@apollo/client'

import { useState, useEffect } from 'react'
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
import { ContractStatusesType } from '../contractStatus.provider.types'
import { useContractStatusesContext } from '../contractStatus.provider'

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

export const useContactStatuses = () => {
  const { updateContractStatuses } = useContractStatusesContext()
  const [storage, setStorage] = useState<Partial<ContractStatusesType>>({})

  const { loading: farmLoading } = useSubscription(CONTRACT_STATUSES_FARM_SUB, {
    onData: ({ data: response }) => {
      const { data } = response
      if (data) setStorage((prevStorage) => ({ ...prevStorage, farm: data.farm }))
    },
  })

  const { loading: farmFactoryLoading } = useSubscription(CONTRACT_STATUSES_FARM_FACTORY_SUB, {
    onData: ({ data: response }) => {
      const { data } = response
      if (data) setStorage((prevStorage) => ({ ...prevStorage, farm_factory: data.farm_factory }))
    },
  })

  const { loading: treasuryLoading } = useSubscription(CONTRACT_STATUSES_TREASURY_SUB, {
    onData: ({ data: response }) => {
      const { data } = response
      if (data) setStorage((prevStorage) => ({ ...prevStorage, treasury: data.treasury }))
    },
  })

  const { loading: treasuryFactoryLoading } = useSubscription(CONTRACT_STATUSES_TREASURY_FACTORY_SUB, {
    onData: ({ data: response }) => {
      const { data } = response
      if (data) setStorage((prevStorage) => ({ ...prevStorage, treasury_factory: data.treasury_factory }))
    },
  })

  const { loading: aggregatorLoading } = useSubscription(CONTRACT_STATUSES_AGGREGATOR_SUB, {
    onData: ({ data: response }) => {
      const { data } = response
      if (data) setStorage((prevStorage) => ({ ...prevStorage, aggregator: data.aggregator }))
    },
  })

  const { loading: aggregatorFactoryLoading } = useSubscription(CONTRACT_STATUSES_AGGREGATOR_FACTORY_SUB, {
    onData: ({ data: response }) => {
      const { data } = response
      if (data) setStorage((prevStorage) => ({ ...prevStorage, aggregator_factory: data.aggregator_factory }))
    },
  })

  const { loading: delegationLoading } = useSubscription(CONTRACT_STATUSES_DELEGATION_SUB, {
    onData: ({ data: response }) => {
      const { data } = response
      if (data) setStorage((prevStorage) => ({ ...prevStorage, delegation: data.delegation }))
    },
  })

  const { loading: doormanLoading } = useSubscription(CONTRACT_STATUSES_DOORMAN_SUB, {
    onData: ({ data: response }) => {
      const { data } = response
      if (data) setStorage((prevStorage) => ({ ...prevStorage, doorman: data.doorman }))
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

  useEffect(() => {
    if (isAllStatusesLoaded && checkStorageProperties(storage)) updateContractStatuses(storage)
  }, [isAllStatusesLoaded, storage, updateContractStatuses])

  return { isLoading: !isAllStatusesLoaded }
}
