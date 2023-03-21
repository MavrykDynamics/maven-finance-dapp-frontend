import { Link } from 'react-router-dom'

import { BUTTON_PRIMARY } from 'app/App.components/Button/Button.constants'

import Button from 'app/App.components/Button/NewButton'

import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { LBHInfoBlock } from './DashboardPersonalComponents.style'
import { LoansPositionTable } from 'pages/LoansDashboard/components/PositionTable'
import { State } from 'reducers'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { GaugeChart } from 'app/App.components/GaugeChart/GaugeChart'
import { getVaultSimpleStatus } from 'pages/LoansDashboard/helpers/position.helpers'
import { GaugeChartStateType, GAUGE_STATE_RISK_PART, GAUGE_STATE_APY_PART } from 'pages/LoansDashboard/LoansDashboard'
import { useMemo, useState, useEffect } from 'react'

export const LendBorrowPosition = ({
  markets,
  userLoansData,
  userLoansRewards,
}: {
  markets: State['loans']['loanTokens']
  userLoansData: State['wallet']['user']['userLoansData']
  userLoansRewards: State['wallet']['user']['myLendingRewardsAmount']
}) => {
  // Calcuating total lended and borrowed by user
  const { totalUserLended, totalUserBorrowed } = useMemo(() => {
    const totalUserLended = userLoansData.userLendings.reduce((acc, { usdAmount }) => (acc += usdAmount), 0)
    const totalUserBorrowed = userLoansData.userBorrowing.reduce((acc, { usdAmount }) => (acc += usdAmount), 0)

    return { totalUserLended, totalUserBorrowed }
  }, [userLoansData])

  // calc averageCollateralRatio for gauge chart
  const vaultRiskGaugeData = useMemo((): GaugeChartStateType => {
    const { ratioSum, vaultsAmount } = markets.reduce<{
      ratioSum: number
      vaultsAmount: number
    }>(
      (acc, { myBorrowingList }) => {
        acc.ratioSum += myBorrowingList.reduce(
          (acc, { collateralRatio }) => (acc += Math.max(0, Math.min(250, collateralRatio))),
          0,
        )
        acc.vaultsAmount += myBorrowingList.length
        return acc
      },
      { ratioSum: 0, vaultsAmount: 0 },
    )

    const averageCollateralRatio = ratioSum / vaultsAmount

    return {
      ...GAUGE_STATE_RISK_PART,
      currentValue: isNaN(averageCollateralRatio) ? 0 : averageCollateralRatio,
      ...getVaultSimpleStatus(isNaN(averageCollateralRatio) ? 0 : averageCollateralRatio),
    }
  }, [markets])

  // calc average apy for user's markets for gauge chart
  const apyGaugeData = useMemo((): GaugeChartStateType => {
    const { apySum, apyMarkets } = markets.reduce<{ apySum: number; apyMarkets: number }>(
      (acc, { lendingAPY, lendingItem }) => {
        if (lendingItem) {
          acc.apySum += lendingAPY
          acc.apyMarkets += 1
        }
        return acc
      },
      { apySum: 0, apyMarkets: 0 },
    )

    const averageAPY = apySum / apyMarkets

    return { ...GAUGE_STATE_APY_PART, currentValue: isNaN(averageAPY) ? 0 : averageAPY }
  }, [markets])

  // Default data for gauge chart will be for vault risk
  const [gaugeData, setGaugeData] = useState<GaugeChartStateType>({
    ...GAUGE_STATE_RISK_PART,
    currentValue: 0,
    text: '',
    status: null,
  })

  // Set gauge chart data for vault risk
  useEffect(() => {
    if (!gaugeData.isAPY) {
      setGaugeData(vaultRiskGaugeData)
    }
  }, [vaultRiskGaugeData])

  return (
    <LBHInfoBlock className="position-tab">
      <GovRightContainerTitleArea>
        <h2>Lend/Borrow Position</h2>
      </GovRightContainerTitleArea>
      <div className="view-markets">
        <Link to={'/loans'}>
          <Button kind={BUTTON_PRIMARY}>View markets</Button>
        </Link>
      </div>

      <div className="acc-stats">
        <div
          className="gauge-chart"
          onMouseEnter={() => setGaugeData(apyGaugeData)}
          onMouseLeave={() => setGaugeData(vaultRiskGaugeData)}
        >
          <GaugeChart
            maxValue={gaugeData.maxValue}
            minValue={gaugeData.minValue}
            currentValue={gaugeData.currentValue}
            isReversed
          >
            <div className={`lend-borrow-position ${gaugeData.status ?? ''}`}>
              <CommaNumber
                value={gaugeData.currentValue}
                className="amount"
                endingText={gaugeData.isAPY ? '%' : ''}
                showDecimal={false}
              />
              <div className="status">{gaugeData.text}</div>
            </div>
          </GaugeChart>
        </div>

        <div className="stats">
          <div className="column">
            <div className="name">Total Lend</div>
            <CommaNumber value={totalUserLended} className="value" beginningText="$" />
          </div>

          <div className="column">
            <div className="name">Total Borrow</div>
            <CommaNumber value={totalUserBorrowed} className="value" beginningText="$" />
          </div>

          <div className="column">
            <div className="name">Rewards to be Distrubuted</div>
            <CommaNumber value={userLoansRewards} className="value" beginningText="$" />
          </div>
        </div>
      </div>

      <LoansPositionTable markets={markets} />
    </LBHInfoBlock>
  )
}
