import { useMemo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

// consts
import { GaugeChartStateType, GAUGE_STATE_RISK_PART, GAUGE_STATE_APY_PART } from 'pages/LoansDashboard/LoansDashboard'
import { BUTTON_LARGE, BUTTON_PRIMARY } from 'app/App.components/Button/Button.constants'
import colors from 'styles/colors'

// types
import { UserLoansDataStateType } from 'providers/UserProvider/user.provider.types'

// helpers
import { getGaugeVaultRiskSimpleStatus } from 'pages/LoansDashboard/helpers/position.helpers'
import { convertNumberForClient, getNumberInBounds } from 'utils/calcFunctions'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'

// context
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useLoansContext } from 'providers/LoansProvider/loans.provider'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'

// view
import { LBHInfoBlock } from './DashboardPersonalComponents.style'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { LoansPositionTable } from 'pages/LoansDashboard/components/PositionTable'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import { GaugeChart } from 'app/App.components/GaugeChart/GaugeChart'
import Button from 'app/App.components/Button/NewButton'

export const LendBorrowPosition = ({
  userLoansRewards,
  totalUserBorrowed,
  totalUserLended,
  userVaultsData,
}: {
  totalUserBorrowed: number
  totalUserLended: number
  userVaultsData: UserLoansDataStateType['userVaultsData']
  userLoansRewards: number
}) => {
  const { tokensMetadata, tokensPrices } = useTokensContext()
  const { userAddress, userMTokens } = useUserContext()
  const { marketsAddresses, marketsMapper } = useLoansContext()

  const {
    preferences: { themeSelected },
  } = useDappConfigContext()

  // calc data for gauge chart
  const { vaultRiskGaugeData, apyGaugeData } = useMemo((): {
    vaultRiskGaugeData: GaugeChartStateType
    apyGaugeData: GaugeChartStateType
  } => {
    const { borrowedAmount, collateralAmount, totalSuppliedValue, sumOfRatioSuppliedToAPY, sumOfRatioBorrowedToAPR } =
      marketsAddresses.reduce(
        (acc, marketTokenAddress) => {
          const market = marketsMapper[marketTokenAddress]
          const token = getTokenDataByAddress({ tokenAddress: marketTokenAddress, tokensMetadata, tokensPrices })
          let borrowedPerMarket = 0

          if (!token || !token.rate || !market) return acc
          const { borrowAPR, lendingAPY, loanMTokenAddress, loanTokenAddress } = market

          const { lendValue } = userMTokens[loanMTokenAddress] ?? { lendValue: 0 }

          const { decimals, rate } = token

          const conveterLendValue = convertNumberForClient({ number: lendValue, grade: decimals })

          const { borrowedAmount = 0, borrowedVaultsCollateralAmount = 0 } = userVaultsData[loanTokenAddress] ?? {}

          //  calculating value risk data & how much borrowed per vault
          acc.collateralAmount += borrowedVaultsCollateralAmount
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
          collateralAmount: 0,
          totalSuppliedValue: 0,
          sumOfRatioSuppliedToAPY: 0,
          sumOfRatioBorrowedToAPR: 0,
        },
      )

    const vaultRiskValue = !userAddress || !collateralAmount ? 0 : (borrowedAmount / collateralAmount) * 100
    const apyNet =
      !userAddress || !totalSuppliedValue ? 0 : (sumOfRatioSuppliedToAPY - sumOfRatioBorrowedToAPR) / totalSuppliedValue

    return {
      vaultRiskGaugeData: {
        ...GAUGE_STATE_RISK_PART,
        currentValue: getNumberInBounds(0, 100, vaultRiskValue),
        ...getGaugeVaultRiskSimpleStatus(vaultRiskValue),
      },
      apyGaugeData: {
        ...GAUGE_STATE_APY_PART,
        currentValue: getNumberInBounds(0, 100, apyNet),
      },
    }
  }, [marketsAddresses, userAddress, marketsMapper, tokensMetadata, tokensPrices, userMTokens, userVaultsData])

  // Default data for gauge chart will be for vault risk
  const [gaugeData, setGaugeData] = useState<GaugeChartStateType>({
    ...GAUGE_STATE_APY_PART,
    currentValue: 0,
    text: '',
    status: null,
  })

  // Set gauge chart data for vault risk
  useEffect(() => {
    if (gaugeData.isAPY) {
      setGaugeData(apyGaugeData)
    }
  }, [apyGaugeData])

  return (
    <LBHInfoBlock className="position-tab">
      <H2Title>Earn/Borrow Position</H2Title>
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
            defaultStrokeColor={colors[themeSelected].regularText}
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
              onMouseEnter={() => setGaugeData(vaultRiskGaugeData)}
              onMouseLeave={() => setGaugeData(apyGaugeData)}
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
            <div className="name">Total Supplied</div>
            <CommaNumber value={totalUserLended} className="value" beginningText="$" />
          </div>

          <div className="column">
            <div className="name">Total Borrowed</div>
            <CommaNumber value={totalUserBorrowed} className="value" beginningText="$" />
          </div>

          <div className="column">
            <div className="name">Earned To Date</div>
            <CommaNumber value={userLoansRewards} className="value" beginningText="$" />
          </div>
        </div>
      </div>

      <LoansPositionTable userVaultsData={userVaultsData} />
    </LBHInfoBlock>
  )
}
