import { useEffect, useMemo, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'

import { useDataLoader } from 'utils/useDataLoader/useDataLoader'
import { State } from 'reducers'

import { BUTTON_LARGE, BUTTON_PRIMARY } from 'app/App.components/Button/Button.constants'
import { calcDiffBetweenTwoNumbersInPersentage } from 'utils/calcFunctions'
import { getGaugeVaultRiskSimpleStatus } from './helpers/position.helpers'
import { getLoansStorage } from 'pages/Loans/Actions/getLoansData.actions'

import Button from 'app/App.components/Button/NewButton'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import { LoansPositionTable } from './components/PositionTable'
import { GaugeChart } from 'app/App.components/GaugeChart/GaugeChart'
import { getUserAvatar } from 'app/App.components/Avatar/Avatar.helpers'

import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { LBHInfoBlock } from 'pages/DashboardPersonal/DashboardPersonalComponents/DashboardPersonalComponents.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { Page } from 'styles'
import { AccountStyledStyled, LoansDashboardStyled, TotalVolumeStyled } from './LoansDashboard.styles'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import colors from 'styles/colors'
import { connect } from 'app/App.components/ConnectWallet/ConnectWallet.actions'
import Icon from 'app/App.components/Icon/Icon.view'
import { checkPlotType } from 'app/App.components/Chart/helpers/Chart.const'
import { SingleValueData } from 'lightweight-charts'

export type GaugeChartStateType = {
  maxValue: number
  minValue: number
  currentValue: number
  text: string
  isAPY: boolean
  status: string | null
}

export const GAUGE_STATE_RISK_PART = {
  maxValue: 100,
  minValue: 0,
  isAPY: false,
}

export const GAUGE_STATE_APY_PART = {
  maxValue: 100,
  minValue: 0,
  isAPY: true,
  text: 'Net APY',
  status: null,
}

export const LoansDashboard = () => {
  const dispatch = useDispatch()
  const { themeSelected } = useSelector((state: State) => state.preferences)
  const {
    isDataLoaded: isLoansLoaded,
    loanTokens,
    chartsData: { lendingChartData, borrowingChartData },
  } = useSelector((state: State) => state.loans)
  const {
    accountPkh,
    user: { myLendingRewardsAmount, userLoansData },
  } = useSelector((state: State) => state.wallet)
  const { satelliteMapper } = useSelector((state: State) => state.satellites)
  const { councilMembers, breakGlassCouncilMembers } = useSelector((state: State) => state.council)

  const { totalBorrowed, totalLended } = loanTokens.reduce<{
    totalLended: number
    totalBorrowed: number
  }>(
    (acc, { totalBorrowed, totalLended }) => {
      acc.totalBorrowed += totalBorrowed
      acc.totalLended += totalLended
      return acc
    },
    {
      totalLended: 0,
      totalBorrowed: 0,
    },
  )

  const { isLoading } = useDataLoader(
    async (isDepsChanged) => {
      try {
        if (!isLoansLoaded || isDepsChanged) {
          await dispatch(getLoansStorage())
        }
      } catch (e) {}
    },
    [accountPkh],
  )

  const userImage = useMemo(
    () =>
      getUserAvatar({
        accountPkh,
        satelliteMapper,
        councilMembers,
        breakGlassCouncilMembers,
      }),
    [accountPkh, breakGlassCouncilMembers, councilMembers, satelliteMapper],
  )

  // Calcuating total lended and borrowed by user
  const { totalUserLended, totalUserBorrowed } = useMemo(() => {
    const totalUserLended = userLoansData.userLendings.reduce((acc, { usdAmount }) => (acc += usdAmount), 0)
    const totalUserBorrowed = userLoansData.userBorrowing.reduce((acc, { usdAmount }) => (acc += usdAmount), 0)

    return { totalUserLended, totalUserBorrowed }
  }, [userLoansData])

  // Calcuating persents of total lended and borrowed changed since last operation
  const { lendingPersentDiff, borrowingPersentDiff } = useMemo(() => {
    const secondLastLending = lendingChartData.at(-2) ?? {},
      secondLastBorrowing = borrowingChartData.at(-2) ?? {}

    const lendingPersentDiff = checkPlotType<SingleValueData>(secondLastLending, ['value'])
      ? calcDiffBetweenTwoNumbersInPersentage(totalLended, secondLastLending.value)
      : 0
    const borrowingPersentDiff = checkPlotType<SingleValueData>(secondLastBorrowing, ['value'])
      ? calcDiffBetweenTwoNumbersInPersentage(totalBorrowed, secondLastBorrowing.value)
      : 0

    return { lendingPersentDiff, borrowingPersentDiff }
  }, [borrowingChartData, lendingChartData, totalBorrowed, totalLended])

  // calc data for gauge chart
  const { vaultRiskGaugeData, apyGaugeData } = useMemo((): {
    vaultRiskGaugeData: GaugeChartStateType
    apyGaugeData: GaugeChartStateType
  } => {
    const { borrowedAmount, borrowCapacity, totalSuppliedValue, sumOfRatioSuppliedToAPY, sumOfRatioBorrowedToAPR } =
      loanTokens.reduce<{
        borrowedAmount: number
        borrowCapacity: number
        totalSuppliedValue: number
        sumOfRatioSuppliedToAPY: number
        sumOfRatioBorrowedToAPR: number
      }>(
        (acc, { borrowAPR, lendingAPY, lendingItem, loanTokenData: { rate, gqlName } }) => {
          let borrowedPerMarket = 0

          const { borrowedAmount = 0, collateralAmount = 0 } = userLoansData.userVaultsData[gqlName] ?? {}

          // calculating value risk data & how much borrowed per vault
          acc.borrowCapacity += collateralAmount / 2
          acc.borrowedAmount += borrowedAmount
          borrowedPerMarket += borrowedAmount

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

    const vaultRiskValue = !accountPkh || !borrowCapacity ? 0 : (borrowedAmount / borrowCapacity) * 100
    const apyNet =
      !accountPkh || !totalSuppliedValue ? 0 : (sumOfRatioSuppliedToAPY - sumOfRatioBorrowedToAPR) / totalSuppliedValue

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
  }, [loanTokens, accountPkh, userLoansData.userVaultsData])

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
    <Page>
      <PageHeader page={'loansDashboard'} avatar={userImage} />

      <LoansDashboardStyled>
        {isLoading ? (
          <DataLoaderWrapper>
            <ClockLoader width={150} height={150} />
            <div className="text">Loading lend & borrow data</div>
          </DataLoaderWrapper>
        ) : (
          <>
            <div className="top">
              <TotalVolumeStyled>
                <GovRightContainerTitleArea>
                  <h2>Total Volume</h2>
                </GovRightContainerTitleArea>

                <CommaNumber value={totalLended + totalBorrowed} beginningText="$" className="total-amount" />

                <div className="details">
                  <div className="column">
                    <div className="label">Total Lending</div>
                    <div className="value-wrap">
                      <CommaNumber value={totalLended} beginningText="$" className="value" />
                      <CommaNumber
                        value={lendingPersentDiff}
                        endingText="%"
                        beginningText={lendingPersentDiff > 0 ? '+' : ''}
                        className={`diff ${lendingPersentDiff ? (lendingPersentDiff > 0 ? 'up' : 'down') : 'neutral'}`}
                      />
                    </div>
                  </div>

                  <div className="column">
                    <div className="label">Total Borroved</div>
                    <div className="value-wrap">
                      <CommaNumber value={totalBorrowed} beginningText="$" className="value" />
                      <CommaNumber
                        value={borrowingPersentDiff}
                        endingText="%"
                        beginningText={borrowingPersentDiff > 0 ? '+' : ''}
                        className={`diff ${
                          borrowingPersentDiff ? (borrowingPersentDiff > 0 ? 'up' : 'down') : 'neutral'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </TotalVolumeStyled>

              <AccountStyledStyled>
                <GovRightContainerTitleArea>
                  <h2>Account Status</h2>
                </GovRightContainerTitleArea>

                <div className="content">
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

                  <div className="details">
                    <div className="column">
                      <div className="label">Total Lend</div>
                      <CommaNumber value={totalUserLended} beginningText="$" className="value" />
                    </div>
                    <div className="column">
                      <div className="label">Total Borrow</div>
                      <CommaNumber value={totalUserBorrowed} beginningText="$" className="value" />
                    </div>
                    <div className="column">
                      <div className="label">Rewards to be Distrubuted</div>
                      <CommaNumber value={myLendingRewardsAmount} beginningText="$" className="value" />
                    </div>
                  </div>
                </div>
              </AccountStyledStyled>
            </div>

            <LBHInfoBlock className="position">
              <GovRightContainerTitleArea>
                <h2>Your Positions</h2>
              </GovRightContainerTitleArea>
              <div className="view-markets">
                {accountPkh ? (
                  <Link to={'/loans'}>
                    <Button kind={BUTTON_PRIMARY} size={BUTTON_LARGE}>
                      View Markets
                    </Button>
                  </Link>
                ) : (
                  <Button kind={BUTTON_PRIMARY} size={BUTTON_LARGE} onClick={() => dispatch(connect())}>
                    <Icon id="wallet" />
                    Connect Wallet
                  </Button>
                )}
              </div>
              <LoansPositionTable markets={loanTokens} userVaultsData={userLoansData.userVaultsData} />
            </LBHInfoBlock>
          </>
        )}
      </LoansDashboardStyled>
    </Page>
  )
}
