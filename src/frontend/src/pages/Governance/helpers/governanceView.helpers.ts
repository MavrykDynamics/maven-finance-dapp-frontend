import { DropDownItemType } from 'app/App.components/DropDown/NewDropdown'

// helpers for cycle dd filter on proposal-history
export const NONE_CYCLE_SELECTED_OPTION = {
  content: 'Choose Cycle Number',
  id: 'notSelected',
}
export const generateCyclesDdOptions = (currentCycle: number): Array<DropDownItemType> => {
  return [
    NONE_CYCLE_SELECTED_OPTION,
    ...Array.from({ length: currentCycle - 1 }, (_, idx) => ({
      content: `${currentCycle - (idx + 1)}`,
      id: currentCycle - (idx + 1),
    })),
  ]
}
