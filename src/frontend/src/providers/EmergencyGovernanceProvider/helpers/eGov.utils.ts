import { EGOV_CONFIG_SUB, EGOV_PROPOSALS_ALL_SUB, EGOV_PROPOSALS_SUB, EMPTY_EGOV_CTX } from './eGov.consts'
import { buildProviderReturnValue } from 'providers/common/utils/buildProviderReturnValue'
import {
  EGovContext,
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

  const isConfigLoading = activeSubs[EGOV_CONFIG_SUB] && config === null
  const isAllProposalsLoading =
    activeSubs[EGOV_PROPOSALS_SUB] === EGOV_PROPOSALS_ALL_SUB &&
    (pastProposals === null || ongoingProposals === null || proposalsMapper === null)

  const isLoading = isAllProposalsLoading || isConfigLoading

  return buildProviderReturnValue(
    eGovCtxState,
    EMPTY_EGOV_CTX,
    { changeEGovSubscriptionsList },
    Boolean(isLoading),
  )
}
