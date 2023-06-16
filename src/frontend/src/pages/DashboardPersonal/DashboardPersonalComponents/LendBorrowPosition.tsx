import { Link } from 'react-router-dom'

import { BUTTON_LARGE, BUTTON_PRIMARY } from 'app/App.components/Button/Button.constants'

import Button from 'app/App.components/Button/NewButton'

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
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import { UserLoansDataStateType } from 'providers/UserProvider/helpers/user.types'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { getMarketUserLengingItem } from 'providers/LoansProvider/helpers/loans.utils'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { convertNumberForClient } from 'utils/calcFunctions'

export const LendBorrowPosition = ({
  markets,
  userLoansRewards,
  totalUserBorrowed,
  totalUserLended,
  userVaultsData,
}: {
  markets: State['loans']['loanTokens']
  totalUserBorrowed: number
  totalUserLended: number
  userVaultsData: UserLoansDataStateType['userVaultsData']
  userLoansRewards: State['wallet']['user']['availableLoansRewards']
}) => {
  const { tokensMetadata, tokensPrices } = useTokensContext()
  const { themeSelected } = useSelector((state: State) => state.preferences)
  const {
    user: { userMTokens },
  } = useSelector((state: State) => state.wallet)

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
        (acc, { borrowAPR, lendingAPY, loanMTokenAddress, loanTokenAddress }) => {
          let borrowedPerMarket = 0

          const token = getTokenDataByAddress({ tokenAddress: loanTokenAddress, tokensMetadata, tokensPrices })
          if (!token || !token.rate) return acc

          const { decimals, rate } = token

          const { lendValue = 0 } = getMarketUserLengingItem(userMTokens, loanMTokenAddress) ?? {}

          const conveterLendValue = convertNumberForClient({ number: lendValue, grade: decimals })

          const { borrowedAmount = 0, collateralAmount = 0 } = userVaultsData[loanTokenAddress] ?? {}

          // calculating value risk data & how much borrowed per vault
          acc.borrowCapacity += collateralAmount / 2
          acc.borrowedAmount += borrowedAmount
          borrowedPerMarket += borrowedAmount

          // calculating net APY supplied & borrowed ratio's
          acc.sumOfRatioSuppliedToAPY += conveterLendValue * rate * lendingAPY
          acc.sumOfRatioBorrowedToAPR += borrowedPerMarket * borrowAPR
          acc.totalSuppliedValue += conveterLendValue * rate
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
    const vaultRiskValue = borrowCapacity ? (borrowedAmount / borrowCapacity) * 100 : 0
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
  }, [markets, userVaultsData])

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
      <H2Title>Lend/Borrow Position</H2Title>
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
            text="Risk value indicates how risky your portfolio is. When the risk value reaches 100, your collateral will be liquidated. 
                      Risk value = Total Borrow/Borrow Limit*100 
                      Net APY = [Σ(Value of Supplied Assets*Supply APY) - Σ(Value of Borrowed Assets*Borrow APY)] / Value of Supplied Assets"
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

      <LoansPositionTable markets={markets} userVaultsData={userVaultsData} />
    </LBHInfoBlock>
  )
}
