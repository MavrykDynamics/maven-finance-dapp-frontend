import { useEffect, useState } from 'react'
import { useSubscription } from '@apollo/client'

import { ContractStatusesConfigSkips } from '../contractStatuses.types'

import { GLASS_BROKEN_SUB, WHITE_LIST_DEVELOPERS_SUB } from '../queries/contractStatusConfig.query'
import { SUB_QUERY, SUB_SKIP, SUB_SUBSCRIBE } from 'utils/api/apollo.consts'

export const useContractStatusConfig = (
  { skipGlassBroken, skipWhitelistDevelopers }: ContractStatusesConfigSkips = {
    skipGlassBroken: SUB_SUBSCRIBE,
    skipWhitelistDevelopers: SUB_SUBSCRIBE,
  },
) => {
  const [shouldSkip, setShouldSkip] = useState<ContractStatusesConfigSkips>({
    skipGlassBroken,
    skipWhitelistDevelopers,
  })

  const { loading: glassBrokenLoading, data: glassBroken } = useSubscription(GLASS_BROKEN_SUB, {
    skip: shouldSkip.skipGlassBroken === SUB_SKIP,
  })

  const { loading: whiteListDevsLoading, data: whitelistDevelopers } = useSubscription(WHITE_LIST_DEVELOPERS_SUB, {
    skip: shouldSkip.skipWhitelistDevelopers === SUB_SKIP,
  })

  useEffect(() => {
    if (glassBrokenLoading && skipGlassBroken === SUB_QUERY) {
      setShouldSkip((prevSkip) => ({
        ...prevSkip,
        skipGlassBroken: SUB_SKIP,
      }))
    }

    if (whiteListDevsLoading && skipWhitelistDevelopers === SUB_QUERY) {
      setShouldSkip((prevSkip) => ({
        ...prevSkip,
        skipWhitelistDevelopers: SUB_SKIP,
      }))
    }
  }, [glassBrokenLoading, skipGlassBroken, skipWhitelistDevelopers, whiteListDevsLoading])

  return {
    isLoading: whiteListDevsLoading || glassBrokenLoading,
    isGlassBroken: glassBroken?.break_glass[0].glass_broken ?? null,
    whitelistDevelopers: whitelistDevelopers?.whitelist_developer.map(({ developer: { address } }) => address) ?? [],
  }
}
