import { useEffect, useMemo, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'

import { useDataLoader } from 'utils/useDataLoader/useDataLoader'
import { State } from 'reducers'

import { BUTTON_PRIMARY } from 'app/App.components/Button/Button.constants'
import { calcDiffBetweenTwoNumbersInPersentage } from 'utils/calcFunctions'
import { getVaultSimpleStatus } from './helpers/position.helpers'
import { getLoansStorage } from 'pages/Loans/Actions/getLoansData.actions'

import Button from 'app/App.components/Button/NewButton'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import { LoansPositionTable } from './components/PositionTable'
import { GaugeChart } from 'app/App.components/GaugeChart/GaugeChart'

import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { LBHInfoBlock } from 'pages/DashboardPersonal/DashboardPersonalComponents/DashboardPersonalComponents.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { Page } from 'styles'
import { AccountStyledStyled, LoansDashboardStyled, TotalVolumeStyled } from './LoansDashboard.styles'

export type GaugeChartStateType = {
  maxValue: number
  minValue: number
  currentValue: number
  text: string
  isAPY: boolean
  status: string | null
}

export const GAUGE_STATE_RISK_PART = {
  maxValue: 250,
  minValue: 100,
  isAPY: false,
}

export const GAUGE_STATE_APY_PART = {
  maxValue: 50,
  minValue: 0,
  isAPY: true,
  text: 'Net APY',
  status: null,
}

/**
 * @SAM
 * to manually change gauge chart values you need to play with maxValue & minValue, for apy and risk charts, they are declared above
 * @GAUGE_STATE_APY_PART & @GAUGE_STATE_RISK_PART respectively,
 * and to test this min & max you need to manually set @currentValue inside return objects in
 * @const apyGaugeData for apy chart
 * @const vaultRiskGaugeData for vault risk chart
 */

export const LoansDashboard = () => {
  const dispatch = useDispatch()

  const {
    isDataLoaded: isLoansLoaded,
    loanTokens,
    chartsData: { totalBorrowed, totalLended, lendingChartData, borrowingChartData },
  } = useSelector((state: State) => state.loans)
  const {
    user: { myLendingRewardsAmount, userLoansData },
  } = useSelector((state: State) => state.wallet)

  const { isLoading } = useDataLoader(async () => {
    try {
      await Promise.all([!isLoansLoaded && dispatch(getLoansStorage())].filter(Boolean))
    } catch (e) {}
  }, [])

  // Calcuating total lended and borrowed by user
  const { totalUserLended, totalUserBorrowed } = useMemo(() => {
    const totalUserLended = userLoansData.userLendings.reduce((acc, { usdAmount }) => {
      return (acc += usdAmount)
    }, 0)
    const totalUserBorrowed = userLoansData.userBorrowing.reduce((acc, { usdAmount }) => {
      return (acc += usdAmount)
    }, 0)

    return { totalUserLended, totalUserBorrowed }
  }, [userLoansData])

  // Calcuating persents of total lended and borrowed changed since last operation
  const { lendingPersentDiff, borrowingPersentDiff } = useMemo(() => {
    const { value: secondLastLending } = lendingChartData.at(-2) ?? {},
      { value: secondLastBorrowing } = borrowingChartData.at(-2) ?? {}

    const lendingPersentDiff = secondLastLending
      ? calcDiffBetweenTwoNumbersInPersentage(totalLended, secondLastLending)
      : 100
    const borrowingPersentDiff = secondLastBorrowing
      ? calcDiffBetweenTwoNumbersInPersentage(totalBorrowed, secondLastBorrowing)
      : 100

    return { lendingPersentDiff, borrowingPersentDiff }
  }, [borrowingChartData, lendingChartData, totalBorrowed, totalLended])

  // calc averageCollateralRatio for gauge chart
  const vaultRiskGaugeData = useMemo((): GaugeChartStateType => {
    const { ratioSum, vaultsAmount } = loanTokens.reduce<{
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
      currentValue: averageCollateralRatio,
      ...getVaultSimpleStatus(averageCollateralRatio),
    }
  }, [loanTokens])

  // calc average apy for user's markets for gauge chart
  const apyGaugeData = useMemo((): GaugeChartStateType => {
    const { apySum, apyMarkets } = loanTokens.reduce<{ apySum: number; apyMarkets: number }>(
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

    return { ...GAUGE_STATE_APY_PART, currentValue: averageAPY }
  }, [loanTokens])

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
      <PageHeader page={'loansDashboard'} avatar={'/images/default-avatar.png'} />

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
                    <CommaNumber value={totalLended} beginningText="$" className="value" />
                    <CommaNumber
                      value={lendingPersentDiff}
                      endingText="%"
                      beginningText={borrowingPersentDiff >= 0 ? '+' : ''}
                      className={`diff ${borrowingPersentDiff >= 0 ? 'up' : 'down'}`}
                    />
                  </div>

                  <div className="column">
                    <div className="label">Total Borroved</div>
                    <CommaNumber value={totalBorrowed} beginningText="$" className="value" />
                    <CommaNumber
                      value={borrowingPersentDiff}
                      endingText="%"
                      beginningText={borrowingPersentDiff >= 0 ? '+' : ''}
                      className={`diff ${borrowingPersentDiff >= 0 ? 'up' : 'down'}`}
                    />
                  </div>
                </div>
              </TotalVolumeStyled>

              <AccountStyledStyled>
                <GovRightContainerTitleArea>
                  <h2>Total Volume</h2>
                </GovRightContainerTitleArea>

                <div className="content">
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
                <Link to={'/loans'}>
                  <Button kind={BUTTON_PRIMARY}>View markets</Button>
                </Link>
              </div>
              <LoansPositionTable markets={loanTokens} />
            </LBHInfoBlock>
          </>
        )}
      </LoansDashboardStyled>
    </Page>
  )
}
