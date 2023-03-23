import { Link } from 'react-router-dom'

import { BUTTON_LARGE, BUTTON_PRIMARY } from 'app/App.components/Button/Button.constants'

import Button from 'app/App.components/Button/NewButton'

import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { LBHInfoBlock } from './DashboardPersonalComponents.style'
import { LoansPositionTable } from 'pages/LoansDashboard/components/PositionTable'
import { State } from 'reducers'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { GaugeChart } from 'app/App.components/GaugeChart/GaugeChart'
import { getGaugeVaultRiskSimpleStatus } from 'pages/LoansDashboard/helpers/position.helpers'
import { GaugeChartStateType, GAUGE_STATE_RISK_PART, GAUGE_STATE_APY_PART } from 'pages/LoansDashboard/LoansDashboard'
import { useMemo, useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import colors from 'styles/colors'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'

export const LendBorrowPosition = ({
  markets,
  userLoansData,
  userLoansRewards,
}: {
  markets: State['loans']['loanTokens']
  userLoansData: State['wallet']['user']['userLoansData']
  userLoansRewards: State['wallet']['user']['myLendingRewardsAmount']
}) => {
  const { themeSelected } = useSelector((state: State) => state.preferences)
  // Calcuating total lended and borrowed by user
  const { totalUserLended, totalUserBorrowed } = useMemo(() => {
    const totalUserLended = userLoansData.userLendings.reduce((acc, { usdAmount }) => (acc += usdAmount), 0)
    const totalUserBorrowed = userLoansData.userBorrowing.reduce((acc, { usdAmount }) => (acc += usdAmount), 0)

    return { totalUserLended, totalUserBorrowed }
  }, [userLoansData])

  // calc data for gauge chart
  const { vaultRiskGaugeData, apyGaugeData } = useMemo((): {
    vaultRiskGaugeData: GaugeChartStateType
    apyGaugeData: GaugeChartStateType
  } => {
    const { borrowedAmount, borrowCapacity, totalSuppliedValue, sumOfRatioSuppliedToAPY, sumOfRatioBorrowedToAPR } =
      markets.reduce<{
        borrowedAmount: number
        borrowCapacity: number
        totalSuppliedValue: number
        sumOfRatioSuppliedToAPY: number
        sumOfRatioBorrowedToAPR: number
      }>(
        (acc, { myBorrowingList, borrowAPR, lendingAPY, lendingItem, loanTokenData: { rate } }) => {
          let borrowedPerMarket = 0

          // calculating value risk data & how much borrowed per vault
          myBorrowingList.forEach(({ borrowedAmount, collateralBalance }) => {
            acc.borrowCapacity += collateralBalance / 2 - borrowedAmount
            acc.borrowedAmount += borrowedAmount
            borrowedPerMarket += borrowedAmount
          })

          // calculating net APY supplied & borrowed ratio's
          acc.sumOfRatioSuppliedToAPY += (lendingItem?.lendValue ?? 0 * rate) * lendingAPY
          acc.sumOfRatioBorrowedToAPR += borrowedPerMarket * borrowAPR
          acc.totalSuppliedValue += lendingItem?.lendValue ?? 0 * rate
          return acc
        },
        {
          borrowedAmount: 0,
          borrowCapacity: 0,
          totalSuppliedValue: 0,
          sumOfRatioSuppliedToAPY: 0,
          sumOfRatioBorrowedToAPR: 0,
        },
      )
    const vaultRiskValue = borrowCapacity ? (borrowedAmount / borrowCapacity) * 100 : 100
    const apyNet = totalSuppliedValue ? (sumOfRatioSuppliedToAPY - sumOfRatioBorrowedToAPR) / totalSuppliedValue : 0

    return {
      vaultRiskGaugeData: {
        ...GAUGE_STATE_RISK_PART,
        currentValue: vaultRiskValue,
        ...getGaugeVaultRiskSimpleStatus(vaultRiskValue),
      },
      apyGaugeData: {
        ...GAUGE_STATE_APY_PART,
        currentValue: apyNet,
      },
    }
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
          <Button kind={BUTTON_PRIMARY} size={BUTTON_LARGE}>
            View Markets
          </Button>
        </Link>
      </div>

      <div className="acc-stats">
        <div className="gauge-chart">
          <CustomTooltip
            iconId="info"
            text="dummy"
            defaultStrokeColor={colors[themeSelected].textColor}
            className="tooltip"
          />
          <GaugeChart
            maxValue={gaugeData.maxValue}
            minValue={gaugeData.minValue}
            currentValue={gaugeData.currentValue}
            isProgress={gaugeData.isAPY}
          >
            <div
              className={`lend-borrow-position ${gaugeData.status ?? ''}`}
              onMouseEnter={() => setGaugeData(apyGaugeData)}
              onMouseLeave={() => setGaugeData(vaultRiskGaugeData)}
            >
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
