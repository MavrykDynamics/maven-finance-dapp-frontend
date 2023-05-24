import { DropDownItemType } from 'app/App.components/DropDown/NewDropdown'
import {
  ONGOING_PROPOSAL_STATUS_TOOLTIP,
  UNLOCKED_PROPOSAL_STATUS_TOOLTIP,
  LOCKED_PROPOSAL_STATUS_TOOLTIP,
} from 'texts/tooltips/governance'
import { ProposalStatus } from 'utils/TypesAndInterfaces/Governance'
import { ProposalStatusType } from 'utils/TypesAndInterfaces/Governance'

// helpers for cycle dd filter on proposal-history
export const NONE_CYCLE_SELECTED_OPTION = {
  content: 'All Cycles',
  id: 'notSelected',
}
export const generateCyclesDdOptions = (currentCycle: number): Array<DropDownItemType> => {
  return [
    NONE_CYCLE_SELECTED_OPTION,
    ...Array.from({ length: currentCycle }, (_, idx) => ({
      content: `${currentCycle - idx}`,
      id: currentCycle - idx,
    })),
  ]
}

export const getTooltipForStatus = (proposalStatus: ProposalStatusType) => {
  switch (proposalStatus) {
    case ProposalStatus.ONGOING:
      return ONGOING_PROPOSAL_STATUS_TOOLTIP
    case ProposalStatus.LOCKED:
      return LOCKED_PROPOSAL_STATUS_TOOLTIP
    case ProposalStatus.UNLOCKED:
      return UNLOCKED_PROPOSAL_STATUS_TOOLTIP
    default:
      return null
  }
}
