import { useSubscription } from '@apollo/client'
import {
  BREAK_GLASS_FARM_SUB,
  BREAK_GLASS_AGGREGATOR_FACTORY_SUB,
  BREAK_GLASS_AGGREGATOR_SUB,
  BREAK_GLASS_DELEGATION_SUB,
  BREAK_GLASS_DOORMAN_SUB,
  BREAK_GLASS_FARM_FACTORY_SUB,
  BREAK_GLASS_TREASURY_FACTORY_SUB,
  BREAK_GLASS_TREASURY_SUB,
} from 'gql/queries/getBreakGlassStorage'
import { useState, useEffect } from 'react'
import { useBreakGlassContext } from '../breakGlass.provider'
import { BreakGlassStatusType } from '../breakGlass.provider.type'

function checkStorageProperties(storage: Partial<BreakGlassStatusType>): boolean {
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

export const useContactStatus = () => {
  const { updateBreakGlassStatus } = useBreakGlassContext()
  const [storage, setStorage] = useState<Partial<BreakGlassStatusType>>({})

  const { loading: farmLoading } = useSubscription(BREAK_GLASS_FARM_SUB, {
    onData: ({ data: response }) => {
      const { data } = response
      if (data) setStorage((prevStorage) => ({ ...prevStorage, farm: data.farm }))
    },
  })

  const { loading: farmFactoryLoading } = useSubscription(BREAK_GLASS_FARM_FACTORY_SUB, {
    onData: ({ data: response }) => {
      const { data } = response
      if (data) setStorage((prevStorage) => ({ ...prevStorage, farm_factory: data.farm_factory }))
    },
  })

  const { loading: treasuryLoading } = useSubscription(BREAK_GLASS_TREASURY_SUB, {
    onData: ({ data: response }) => {
      const { data } = response
      if (data) setStorage((prevStorage) => ({ ...prevStorage, treasury: data.treasury }))
    },
  })

  const { loading: treasuryFactoryLoading } = useSubscription(BREAK_GLASS_TREASURY_FACTORY_SUB, {
    onData: ({ data: response }) => {
      const { data } = response
      if (data) setStorage((prevStorage) => ({ ...prevStorage, treasury_factory: data.treasury_factory }))
    },
  })

  const { loading: aggregatorLoading } = useSubscription(BREAK_GLASS_AGGREGATOR_SUB, {
    onData: ({ data: response }) => {
      const { data } = response
      if (data) setStorage((prevStorage) => ({ ...prevStorage, aggregator: data.aggregator }))
    },
  })

  const { loading: aggregatorFactoryLoading } = useSubscription(BREAK_GLASS_AGGREGATOR_FACTORY_SUB, {
    onData: ({ data: response }) => {
      const { data } = response
      if (data) setStorage((prevStorage) => ({ ...prevStorage, aggregator_factory: data.aggregator_factory }))
    },
  })

  const { loading: delegationLoading } = useSubscription(BREAK_GLASS_DELEGATION_SUB, {
    onData: ({ data: response }) => {
      const { data } = response
      if (data) setStorage((prevStorage) => ({ ...prevStorage, delegation: data.delegation }))
    },
  })

  const { loading: doormanLoading } = useSubscription(BREAK_GLASS_DOORMAN_SUB, {
    onData: ({ data: response }) => {
      const { data } = response
      if (data) setStorage((prevStorage) => ({ ...prevStorage, doorman: data.doorman }))
    },
  })

  const isLoaded =
    !farmLoading &&
    !farmFactoryLoading &&
    !treasuryLoading &&
    !treasuryFactoryLoading &&
    !aggregatorLoading &&
    !aggregatorFactoryLoading &&
    !delegationLoading &&
    !doormanLoading

  useEffect(() => {
    if (isLoaded && checkStorageProperties(storage)) {
      updateBreakGlassStatus(storage as BreakGlassStatusType)
    }
  }, [isLoaded, storage, updateBreakGlassStatus])

  return { isLoading: !isLoaded }
}
