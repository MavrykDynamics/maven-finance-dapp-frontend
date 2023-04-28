import { DropDownItemType } from 'app/App.components/DropDown/NewDropdown'

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
