import { useSelector } from 'react-redux'
import { State } from '../../../reducers'

import TimeRemaining from '../../Governance/components/TimeRemaining/TimeRemaining.controller'
import { SlidingTabButtons } from '../../../app/App.components/SlidingTabButtons/SlidingTabButtons.controller'
import { getSeparateSnakeCase } from '../../../utils/parse'

import {
  CurrentPhaseContainer,
  PropSubmissionTopBarStyled,
  PropSubTopBarEmergencyGovText,
  PropSubTopBarPhaseText,
  PropSubTopBarTabsContainer,
  PropSubTopBarTabsText,
  PropSubTopBarTimeContainer,
  PropSubTopBarValueText,
} from './PropSubmissionTopBar.style'

export type PropSubmissionTopBarProps = {
  value?: number
  valueCallback?: (val?: number) => void
}

const GOV_PROPOSAL_SUBMISSION_ITEMS = [
  { text: 'Stage 1', id: 1, active: true },
  { text: 'Stage 2', id: 2, active: false },
  { text: 'Stage 3', id: 3, active: false },
]

// TODO redo markup for it

export const PropSubmissionTopBar = ({ value, valueCallback }: PropSubmissionTopBarProps) => {
  const { governancePhase } = useSelector((state: State) => state.governanceConfig)

  const handleChangeTab = (tabId?: number) => {
    // TODO: Implement function and dispatch action
    if (valueCallback) valueCallback(tabId)
  }

  return (
    <PropSubmissionTopBarStyled>
      <PropSubTopBarTabsContainer>
        <PropSubTopBarTabsText>Submission Process:</PropSubTopBarTabsText>
        <SlidingTabButtons tabItems={GOV_PROPOSAL_SUBMISSION_ITEMS} onClick={handleChangeTab} />
      </PropSubTopBarTabsContainer>

      <PropSubTopBarTimeContainer>
        <CurrentPhaseContainer>
          <PropSubTopBarPhaseText>Current Period: </PropSubTopBarPhaseText>
          <PropSubTopBarValueText>{getSeparateSnakeCase(governancePhase)}</PropSubTopBarValueText>
        </CurrentPhaseContainer>
        <TimeRemaining />
      </PropSubTopBarTimeContainer>
    </PropSubmissionTopBarStyled>
  )
}
