import { EmergencyGovernanceStorage } from 'utils/TypesAndInterfaces/EmergencyGovernance'
import { GET_EMERGENCY_GOVERNANCE_STORAGE } from '../pages/EmergencyGovernance/EmergencyGovernance.actions'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'

export interface EmergencyGovernanceState {
  eGovProposals: EmergencyGovernanceStorage['emergencyGovernanceLedger']
  config: {
    emergencyGovActive: boolean
    hasAcknowledgeEmergencyGovernance: boolean
    proposalTitleMaxLength: number
    proposalDescMaxLength: number
    sMvkPercentageRequired: number
    requiredFeeMutez: number
    minStakedMvkRequiredToTrigger: number
    minStakedMvkRequiredToVote: number
    currentEmergencyGovernanceRecordId: number
    nextEmergencyGovernanceRecordId: number
  }
  isLoaded: boolean
}
const emergencyGovernanceDefaultState: EmergencyGovernanceState = {
  eGovProposals: [],
  config: {
    emergencyGovActive: false,
    hasAcknowledgeEmergencyGovernance: false,
    proposalTitleMaxLength: 400,
    proposalDescMaxLength: 400,
    requiredFeeMutez: 10,
    sMvkPercentageRequired: 0,
    minStakedMvkRequiredToTrigger: 0,
    minStakedMvkRequiredToVote: 0,
    currentEmergencyGovernanceRecordId: 0,
    nextEmergencyGovernanceRecordId: 0,
  },
  isLoaded: false,
}

export function emergencyGovernance(state = emergencyGovernanceDefaultState, action: Action) {
  switch (action.type) {
    case GET_EMERGENCY_GOVERNANCE_STORAGE:
      return {
        ...state,
        eGovProposals: action.emergencyGovernanceLedger,
        config: action.eGovConfig,
        isLoaded: true,
      }
    default:
      return state
  }
}
