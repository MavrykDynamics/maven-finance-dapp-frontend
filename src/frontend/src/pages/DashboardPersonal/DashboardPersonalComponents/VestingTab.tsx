import { useDispatch, useSelector } from 'react-redux'
import { Redirect } from 'react-router-dom'
import dayjs from 'dayjs'

import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'

import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { VestingTabStyled } from './DashboardPersonalComponents.style'

import { State } from 'reducers'
import Button from 'app/App.components/Button/NewButton'
import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { parseDate } from 'utils/time'
import { PORTFOLIO_TAB_ID } from '../DashboardPersonal.utils'
import { claimVestingReward } from '../DashboardPersonal.actions'
import { UserActionHistory } from './UserOperationsHistory'

const VestingTab = () => {
  const dispatch = useDispatch()
  const { vesteesMapper } = useSelector((state: State) => state.vesting)
  const { isActionActive } = useSelector((state: State) => state.loading)
  const { accountPkh = '' } = useSelector((state: State) => state.wallet)

  const vesteeRecord = vesteesMapper[accountPkh]

  if (!vesteeRecord) return <Redirect to={`/dashboard-personal/${PORTFOLIO_TAB_ID}`} />

  // TODO: test claim vestee reward action
  const handleClaimVestingReward = async () => await dispatch(claimVestingReward())

  const { vestingMonth, totalAllocated, totalRemainded, rewardPerMonth, nextRewardDate, lastClaimDate } = vesteeRecord

  const lastClaimTime = dayjs(lastClaimDate),
    nextClaimTime = dayjs(nextRewardDate),
    hasRewardsFor = Math.max(0, nextClaimTime.diff(lastClaimTime, 'month')),
    isClaimBtnDisabled = rewardPerMonth === 0 || hasRewardsFor === 0 || isActionActive

  return (
    <>
      <VestingTabStyled>
        <GovRightContainerTitleArea>
          <h2>My Vesting</h2>
        </GovRightContainerTitleArea>

        <div className="vesting-data">
          <div className="column">
            <div className="name">Vesting Period</div>
            <div className="value">
              <CommaNumber value={vestingMonth} endingText="mos." />
            </div>
          </div>

          <div className="column">
            <div className="name">Total Vesting Amount</div>
            <div className="value">
              <CommaNumber value={totalAllocated} endingText="MVK" />
            </div>
          </div>

          <div className="column">
            <div className="name">Amount Left to Vest</div>
            <div className="value">
              <CommaNumber value={totalRemainded} endingText="MVK" />
            </div>
          </div>

          <div className="column">
            <div className="name">Ready to Claim</div>
            <div className="value">
              <CommaNumber value={rewardPerMonth * hasRewardsFor} endingText="MVK" />
            </div>
          </div>

          <div className="column">
            <div className="name">Next Claim</div>
            <div className="value">{parseDate({ time: nextRewardDate, timeFormat: 'MMM Do, YYYY' })}</div>
          </div>

          <Button
            kind={BUTTON_PRIMARY}
            form={BUTTON_WIDE}
            disabled={isClaimBtnDisabled}
            onClick={handleClaimVestingReward}
          >
            Claim
          </Button>
        </div>
      </VestingTabStyled>

      <UserActionHistory />
    </>
  )
}

export default VestingTab
