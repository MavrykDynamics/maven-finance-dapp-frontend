import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Toggle from 'app/App.components/Toggle/Toggle.view'
import { useState } from 'react'
import { EarnHistoryStyled } from './DashboardPersonalComponents.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { MVK_TOKEN_SYMBOL, XTZ_TOKEN_SYMBOL } from 'utils/constants'

export type DashboardPersonalEarningsHistoryProps = {
  satelliteRewards: number
  farmsRewards: number
  exitRewards: number
  lendingIncome: number
}

const DashboardPersonalEarningsHistory = ({
  lendingIncome,
  satelliteRewards,
  farmsRewards,
  exitRewards,
}: DashboardPersonalEarningsHistoryProps) => {
  const { tokensPrices } = useTokensContext()
  const [switcherActive, setSwithcerActive] = useState(true)

  const mvkRate = tokensPrices[MVK_TOKEN_SYMBOL]
  const xtzRate = tokensPrices[XTZ_TOKEN_SYMBOL]

  return (
    <EarnHistoryStyled>
      <div className="top">
        <H2Title>Earnings History</H2Title>
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
              showDecimal
              decimalsToShow={2}
            />
          </div>
        </div>
        <div className="stat-block">
          <div className="name">Farming Rewards</div>
          <div className="value">
            <CommaNumber
              value={switcherActive ? farmsRewards : farmsRewards * mvkRate}
              endingText={switcherActive ? 'MVK' : 'USD'}
              showDecimal
              decimalsToShow={2}
            />
          </div>
        </div>
        <div className="stat-block">
          <div className="name">Exit Fee Rewards</div>
          <div className="value">
            <CommaNumber
              value={switcherActive ? exitRewards : exitRewards * mvkRate}
              endingText={switcherActive ? 'MVK' : 'USD'}
              showDecimal
              decimalsToShow={2}
            />
          </div>
        </div>
        <div className="stat-block">
          <div className="name">Lending Income</div>
          <div className="value">
            <CommaNumber
              value={switcherActive ? lendingIncome / xtzRate : lendingIncome}
              endingText={switcherActive ? 'XTZ' : 'USD'}
              showDecimal
              decimalsToShow={2}
            />
          </div>
        </div>
      </div>
    </EarnHistoryStyled>
  )
}

export default DashboardPersonalEarningsHistory
