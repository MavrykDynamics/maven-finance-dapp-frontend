import { EGOV_CONFIG_SUB, EGOV_PROPOSALS_ALL_SUB, EGOV_PROPOSALS_SUB, EMPTY_EGOV_CTX } from './eGov.consts'
import { replaceNullValuesWithDefault } from 'providers/common/utils/repalceNullValuesWithDefault'
import {
  EGovContext,
  EGovContextState,
  EGovSubsRecordType,
  NullableEGovContextState,
} from '../emergencyGovernance.provider.types'

export const getEGovProviderReturnValue = ({
  eGovCtxState,
  changeEGovSubscriptionsList,
  activeSubs,
}: {
  eGovCtxState: NullableEGovContextState
  changeEGovSubscriptionsList: EGovContext['changeEGovSubscriptionsList']
  activeSubs: EGovSubsRecordType
}) => {
  const { config, pastProposals, proposalsMapper, ongoingProposals } = eGovCtxState
  const commonToReturn = {
    changeEGovSubscriptionsList,
  }

  const isConfigLoading = activeSubs[EGOV_CONFIG_SUB] && config === null
  const isAllProposalsLoading =
    activeSubs[EGOV_PROPOSALS_SUB] === EGOV_PROPOSALS_ALL_SUB &&
    (pastProposals === null || ongoingProposals === null || proposalsMapper === null)

  const isLoading = isAllProposalsLoading || isConfigLoading

  // if provider is loading smth return loading true and default empty context (nonNullable)
  if (isLoading) {
    return {
      ...commonToReturn,
      ...EMPTY_EGOV_CTX,
      isLoading: true,
    }
  }
  // if subscribed data loaded return loading false and contextState where all null values replaced with nonNullable value
  const nonNullableProviderValue = replaceNullValuesWithDefault<EGovContextState>(eGovCtxState, EMPTY_EGOV_CTX)
  return {
    ...commonToReturn,
    ...nonNullableProviderValue,
    isLoading: false,
  }
}
