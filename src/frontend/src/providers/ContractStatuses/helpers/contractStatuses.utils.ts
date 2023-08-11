// utils
import { replaceNullValuesWithDefault } from 'providers/common/utils/repalceNullValuesWithDefault'

// types
import {
  ContractStatusesContext,
  ContractStatusesContextStateType,
  ContractStatusesSubsRecordType,
  NullableContractStatusesContextStateType,
} from '../contractStatuses.types'
import { GlasssBrokenStatusAndWhiteListDevsQuery } from 'utils/__generated__/graphql'

// consts
import {
  CONTRACT_STATUSES_ALL_SUB,
  CONTRACT_STATUSES_CONFIG_SUB,
  EMPTY_CONTRACT_STATUSES_CTX,
} from './contractStatuses.consts'

type ContractStatusesContextReturnValueArgs = {
  contractStatusesCtxState: NullableContractStatusesContextStateType
  activeSubs: ContractStatusesSubsRecordType
  changeLoansSubscriptionsList: ContractStatusesContext['changeLoansSubscriptionsList']
}

export const getContractStatusesProviderReturnValue = ({
  contractStatusesCtxState,
  changeLoansSubscriptionsList,
  activeSubs,
}: ContractStatusesContextReturnValueArgs) => {
  const commonToReturn = {
    changeLoansSubscriptionsList,
  }

  const { contractStatuses, config } = contractStatusesCtxState

  const isLoadingContractStatusesData = activeSubs[CONTRACT_STATUSES_ALL_SUB] && contractStatuses === null
  const isContractStatusesConfigEmpty = config === null

  const isLoading =
    isLoadingContractStatusesData ||
    isContractStatusesConfigEmpty ||
    (!activeSubs[CONTRACT_STATUSES_CONFIG_SUB] &&
      config === null &&
      !activeSubs[CONTRACT_STATUSES_ALL_SUB] &&
      contractStatuses === null)

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
    isLoading: false,
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
