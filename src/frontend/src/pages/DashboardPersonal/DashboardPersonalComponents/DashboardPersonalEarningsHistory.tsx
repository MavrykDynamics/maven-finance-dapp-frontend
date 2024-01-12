import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Toggle from 'app/App.components/Toggle/Toggle.view'
import { useState } from 'react'
import { EarnHistoryStyled } from './DashboardPersonalComponents.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { MVN_TOKEN_SYMBOL, XTZ_TOKEN_SYMBOL } from 'utils/constants'
import { SECONDARY_TOGGLE } from 'app/App.components/Toggle/Toggle.consts'

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
  const [switcherActive, setSwitcherActive] = useState(true)

  const mvnRate = tokensPrices[MVN_TOKEN_SYMBOL]
  const xtzRate = tokensPrices[XTZ_TOKEN_SYMBOL]

  return (
    <EarnHistoryStyled>
      <div className="top">
        <H2Title>Earnings History</H2Title>
        <Toggle
          prefix={'USD'}
          sufix={'MVN'}
          kind={SECONDARY_TOGGLE}
          checked={switcherActive}
          onChange={() => setSwitcherActive(!switcherActive)}
        />
      </div>
      <div className="grid">
        <div className="stat-block">
          <div className="name">Satellite Rewards</div>
          <div className="value">
            <CommaNumber
              value={switcherActive ? satelliteRewards : satelliteRewards * mvnRate}
              endingText={switcherActive ? 'MVN' : 'USD'}
              showDecimal
              decimalsToShow={2}
            />
          </div>
        </div>
        <div className="stat-block">
          <div className="name">Farming Rewards</div>
          <div className="value">
            <CommaNumber
              value={switcherActive ? farmsRewards : farmsRewards * mvnRate}
              endingText={switcherActive ? 'MVN' : 'USD'}
              showDecimal
              decimalsToShow={2}
            />
          </div>
        </div>
        <div className="stat-block">
          <div className="name">Exit Fee Rewards</div>
          <div className="value">
            <CommaNumber
              value={switcherActive ? exitRewards : exitRewards * mvnRate}
              endingText={switcherActive ? 'MVN' : 'USD'}
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
