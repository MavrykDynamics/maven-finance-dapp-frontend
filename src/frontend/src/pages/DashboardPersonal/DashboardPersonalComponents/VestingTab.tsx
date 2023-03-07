import { useSelector } from 'react-redux'
import { Link, Redirect } from 'react-router-dom'

import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'

import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { VestingTabStyled } from './DashboardPersonalComponents.style'

import { State } from 'reducers'
import Button from 'app/App.components/Button/NewButton'
import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { parseDate } from 'utils/time'
import { PORTFOLIO_TAB_ID } from '../DashboardPersonal.utils'

const VestingTab = () => {
  const { vesteesMapper } = useSelector((state: State) => state.vesting)
  const { accountPkh = '' } = useSelector((state: State) => state.wallet)

  const vesteeRecord = vesteesMapper[accountPkh]

  if (!vesteeRecord) return <Redirect to={`/dashboard-personal/${PORTFOLIO_TAB_ID}`} />

  return (
    <VestingTabStyled>
      <GovRightContainerTitleArea>
        <h2>My Vesting</h2>
      </GovRightContainerTitleArea>

      <div className="vesting-data">
        <div className="column">
          <div className="name">Vesting Period</div>
          <div className="value">
            <CommaNumber value={vesteeRecord.vestingMonth} endingText="mos" />
          </div>
        </div>

        <div className="column">
          <div className="name">Total Vesting Amount</div>
          <div className="value">
            <CommaNumber value={vesteeRecord.totalAllocated} endingText="MVK" />
          </div>
        </div>

        <div className="column">
          <div className="name">Amount Left to Vest</div>
          <div className="value">
            <CommaNumber value={vesteeRecord.totalRemainded} endingText="MVK" />
          </div>
        </div>

        <div className="column">
          <div className="name">Ready to Claim</div>
          <div className="value">
            <CommaNumber value={vesteeRecord.rewardPerMonth} endingText="MVK" />
          </div>
        </div>

        <div className="column">
          <div className="name">Next Claim</div>
          <div className="value">{parseDate({ time: vesteeRecord.nextRewardDate, timeFormat: 'MMM Do, YYYY' })}</div>
        </div>

        <Button kind={BUTTON_PRIMARY} form={BUTTON_WIDE}>
          Claim
        </Button>
      </div>
    </VestingTabStyled>
  )
}

export default VestingTab
