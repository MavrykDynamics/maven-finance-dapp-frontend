import { useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'

import { useDataLoader } from 'utils/useDataLoader/useDataLoader'
import { State } from 'reducers'

import { BUTTON_PRIMARY } from 'app/App.components/Button/Button.constants'
import { getLoansStorage } from 'pages/Loans/Actions/getLoansData.actions'

import Button from 'app/App.components/Button/NewButton'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import { LoansPositionTable } from './components/PositionTable'

import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { LBHInfoBlock } from 'pages/DashboardPersonal/DashboardPersonalComponents/DashboardPersonalComponents.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { Page } from 'styles'
import { AccountStyledStyled, LoansDashboardStyled, TotalVolumeStyled } from './LoansDashboard.styles'
import { calcDiffBetweenTwoNumbersInPersentage } from 'utils/calcFunctions'

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

  return (
    <Page>
      <PageHeader page={'dashboard'} avatar={'/images/default-avatar.png'} />

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
                  <div className="gauge-chart"></div>

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

            <LBHInfoBlock>
              <GovRightContainerTitleArea>
                <h2>Lend/Borrow Position</h2>
              </GovRightContainerTitleArea>
              <div className="view-markets">
                <Link to={'/loans'}>
                  <Button kind={BUTTON_PRIMARY}>View markets</Button>
                </Link>
              </div>

              <LoansPositionTable />
            </LBHInfoBlock>
          </>
        )}
      </LoansDashboardStyled>
    </Page>
  )
}
