// utils
import { replaceNullValuesWithDefault } from 'providers/common/utils/repalceNullValuesWithDefault'
import { normalizeContractStatuses } from './normalizeContractStatuses'

// types
import {
  ContractStatusesContext,
  ContractStatusesContextStateType,
  ContractStatusesSubsRecordType,
  NullableContractStatusesContextStateType,
} from '../contractStatuses.provider.types'
import { GlassBrokenStatusAndWhiteListDevsQuery } from 'utils/__generated__/graphql'

// consts
import {
  CONTRACT_STATUSES_ALL_SUB,
  CONTRACT_STATUSES_CONFIG_SUB,
  DEFAULT_FAIL_PERCENTAGE,
  EMPTY_CONTRACT_STATUSES_CTX,
} from './contractStatuses.consts'

type ContractStatusesContextReturnValueArgs = {
  contractStatusesCtxState: NullableContractStatusesContextStateType
  activeSubs: ContractStatusesSubsRecordType
  changeContractStatusesSubscriptionsList: ContractStatusesContext['changeContractStatusesSubscriptionsList']
}

export const getContractStatusesProviderReturnValue = ({
  contractStatusesCtxState,
  changeContractStatusesSubscriptionsList,
  activeSubs,
}: ContractStatusesContextReturnValueArgs) => {
  const commonToReturn = {
    changeContractStatusesSubscriptionsList,
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
  data: GlassBrokenStatusAndWhiteListDevsQuery,
): NullableContractStatusesContextStateType['config'] => {
  const isGlassBroken = data.break_glass[0].glass_broken ?? null
  const whitelistDevelopers = data?.whitelist_developer.map(({ developer: { address } }) => address) ?? []

  return {
    isGlassBroken,
    whitelistDevelopers,
    // will be updated in another query, so we return the default value
    areContractMethodsPaused: false,
  }
}

/**
 * Task number: https://memcrab.atlassian.net/browse/MAV-2216
 * @param normalizedContractStatuses normalized contract statuses from graphql query
 * @param failPercentage number from 0 to 100 which indicates on which point we should get paused status (if wrong number = default value will be 85)
 * @returns
 */
export const getContractMethodsPausedStatus = (
  normalizedContractStatuses: ReturnType<typeof normalizeContractStatuses>,
  failPercentage: number,
) => {
  // check for correct percentage value
  const percentage = failPercentage <= 100 && failPercentage >= 1 ? failPercentage : DEFAULT_FAIL_PERCENTAGE

  // get array of booleans which are indicating contract methods statuses
  const contractMethodsPausedStatuses = normalizedContractStatuses.map((c) => Object.values(c.methods)).flat()
  // get paused and working contract methods data
  const { paused, working } = contractMethodsPausedStatuses.reduce<{ paused: number; working: number }>(
    (acc, isPaused) => {
      if (isPaused === false) acc.working = acc.working + 1
      else acc.paused = acc.paused + 1

      return acc
    },
    { paused: 0, working: 0 },
  )

  const truePercentage = (paused / working) * 100

  return truePercentage >= percentage
}
