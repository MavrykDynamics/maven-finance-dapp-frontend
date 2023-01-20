import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Toggle from 'app/App.components/Toggle/Toggle.view'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { useState } from 'react'
import { EarnHistoryStyled } from './DashboardPersonalComponents.style'

export type DashboardPersonalEarningsHistoryProps = {
  mvkRate: number
  xtzRate: number
  satelliteRewards: number
  farmsRewards: number
  exitRewards: number
  lendingIncome: number
}

const DashboardPersonalEarningsHistory = ({
  mvkRate,
  xtzRate,
  lendingIncome,
  satelliteRewards,
  farmsRewards,
  exitRewards,
}: DashboardPersonalEarningsHistoryProps) => {
  const [switcherActive, setSwithcerActive] = useState(true)

  return (
    <EarnHistoryStyled>
      <div className="top">
        <GovRightContainerTitleArea>
          <h1>Earnings History</h1>
        </GovRightContainerTitleArea>
        <Toggle
          prefix={'USD'}
          sufix={'MVK'}
          className="personal-dashboard-toggler"
          checked={switcherActive}
          onChange={() => setSwithcerActive(!switcherActive)}
        />
      </div>
      <div className="grid">
        <div className="stat-block">
          <div className="name">Satellite Rewards</div>
          <div className="value">
            <CommaNumber
              value={switcherActive ? satelliteRewards : satelliteRewards * mvkRate}
              endingText={switcherActive ? 'MVK' : 'USD'}
            />
          </div>
        </div>
        <div className="stat-block">
          <div className="name">Farming Rewards</div>
          <div className="value">
            <CommaNumber
              value={switcherActive ? farmsRewards : farmsRewards * mvkRate}
              endingText={switcherActive ? 'MVK' : 'USD'}
            />
          </div>
        </div>
        <div className="stat-block">
          <div className="name">Exit Fee Rewards</div>
          <div className="value">
            <CommaNumber
              value={switcherActive ? exitRewards : exitRewards * mvkRate}
              endingText={switcherActive ? 'MVK' : 'USD'}
            />
          </div>
        </div>
        <div className="stat-block">
          <div className="name">Lending Income</div>
          <div className="value">
            <CommaNumber
              value={switcherActive ? lendingIncome : lendingIncome * xtzRate}
              endingText={switcherActive ? 'XTZ' : 'USD'}
            />
          </div>
        </div>
      </div>
    </EarnHistoryStyled>
  )
}

export default DashboardPersonalEarningsHistory
