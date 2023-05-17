import { DropDownItemType } from 'app/App.components/DropDown/NewDropdown'
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
      return 'Text for tooltip'
    case ProposalStatus.LOCKED:
      return 'Text for tooltip'
    case ProposalStatus.UNLOCKED:
      return 'Text for tooltip'
    default:
      return null
  }
}
