import { replaceNullValuesWithDefault } from 'providers/common/utils/repalceNullValuesWithDefault'
import { ProposalsContext, ProposalsContextStateType, ProposalsSubsRecordType } from '../proposals.provider.types'
import { EMPTY_PROPOSALS_CTX } from './proposals.const'

export const getProposalsProviderReturnValue = ({
  proposalsCtxState,
  changeProposalsSubscriptionsList,
  activeSubs,
}: {
  proposalsCtxState: ProposalsContextStateType
  changeProposalsSubscriptionsList: ProposalsContext['changeProposalsSubscriptionsList']
  activeSubs: ProposalsSubsRecordType
}) => {
  const commonToReturn = {
    changeProposalsSubscriptionsList,
  }

  const isLoading = true

  // if provider is loading smth return loading true and default empty context (nonNullable)
  if (isLoading) {
    return {
      ...commonToReturn,
      ...EMPTY_PROPOSALS_CTX,
      isLoading: true,
    }
  }

  // if subscribed data loaded return loading false and contextState where all null values replaced with nonNullable value
  const nonNullableProviderValue = replaceNullValuesWithDefault<ProposalsContextStateType>(
    proposalsCtxState,
    EMPTY_PROPOSALS_CTX,
  )

  return {
    ...commonToReturn,
    ...nonNullableProviderValue,
    isLoading: false,
  }
}
