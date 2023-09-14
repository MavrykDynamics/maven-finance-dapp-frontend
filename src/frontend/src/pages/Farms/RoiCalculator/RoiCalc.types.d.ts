import { InputStatusType } from '../../../app/App.components/Input/Input.constants'
import { SlidingTabButtonType } from '../../../app/App.components/SlidingTabButtons/SlidingTabButtons.controller'
import { BOTTOM_INPUT, TOP_INPUT } from './RoiCalc.helpers'

export type SelectedTabsStateType = {
  balanceTab: null | (SlidingTabButtonType & { actualValue: number })
  stakedTab: null | (SlidingTabButtonType & { actualValue: number })
  compoundTab: null | (SlidingTabButtonType & { actualValue: number })
}

export type InputValuesType = {
  [TOP_INPUT]: number | ''
  [BOTTOM_INPUT]: number | ''
}

export type InputStatusesType = {
  amountStatus: InputStatusType
  backwardStatus: InputStatusType
}
