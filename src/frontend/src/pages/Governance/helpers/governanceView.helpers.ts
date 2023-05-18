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
      return 'Proposal is open for voting during this voting round.'
    case ProposalStatus.LOCKED:
      return 'Proposal is locked. Proposal data can no longer be edited. Able to be voted on.'
    case ProposalStatus.UNLOCKED:
      return 'Proposal is unlocked and can be edited at this time. Can only be voted on once the proposer locks it.'
    default:
      return null
  }
}
