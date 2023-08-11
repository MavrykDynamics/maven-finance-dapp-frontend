import { replaceNullValuesWithDefault } from 'providers/common/utils/repalceNullValuesWithDefault'
import { ContractStatusesContextStateType, NullableContractStatusesContextStateType } from '../contractStatuses.types'
import { EMPTY_CONTRACT_STATUSES_CTX } from './contractStatuses.consts'
import { GlasssBrokenStatusAndWhiteListDevsQuery } from 'utils/__generated__/graphql'

type DoormanContextReturnValueArgs = {
  contractStatusesCtxState: NullableContractStatusesContextStateType
  isLoading: boolean
}

export const getContractStatusesProviderReturnValue = ({
  contractStatusesCtxState,
  isLoading,
}: DoormanContextReturnValueArgs) => {
  const commonToReturn = {
    isLoading,
  }

  // if provider is loading smth return loading true and default empty context (nonNullable)
  if (isLoading) {
    return {
      ...commonToReturn,
      ...EMPTY_CONTRACT_STATUSES_CTX,
      isLoading: true,
    }
  }

  // if subscribed data loaded return loading false and contextState where all null values replaced with nonNullable value
  const nonNullableProviderValue = replaceNullValuesWithDefault<ContractStatusesContextStateType>(
    contractStatusesCtxState,
    EMPTY_CONTRACT_STATUSES_CTX,
  )
  return {
    ...commonToReturn,
    ...nonNullableProviderValue,
  }
}

export const normalizeContractStatusesConfig = (
  data: GlasssBrokenStatusAndWhiteListDevsQuery,
): NullableContractStatusesContextStateType['config'] => {
  const isGlassBroken = data.break_glass[0].glass_broken ?? null
  const whitelistDevelopers = data?.whitelist_developer.map(({ developer: { address } }) => address) ?? []

  return {
    isGlassBroken,
    whitelistDevelopers,
  }
}

// CONFIG
// return {
//     isLoading: whiteListDevsLoading || glassBrokenLoading,
//     isGlassBroken: glassBroken?.break_glass[0].glass_broken ?? null,
//     whitelistDevelopers: whitelistDevelopers?.whitelist_developer.map(({ developer: { address } }) => address) ?? [],
//   }
