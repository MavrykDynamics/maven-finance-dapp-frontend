import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import { State } from 'reducers'
import { LoanMarketType } from 'utils/TypesAndInterfaces/Loans'
import { calcDiffBetweenTwoNumbersInPersentage } from 'utils/calcFunctions'
import { PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'

import Icon from 'app/App.components/Icon/Icon.view'
import NewButton from 'app/App.components/Button/NewButton'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'

import { StatBlock } from '../Dashboard.style'
import { LendingContentStyled, TabWrapperStyled, EmptyContainer } from './DashboardTabs.style'
import { BGPrimaryTitle } from 'pages/BreakGlass/BreakGlass.style'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'

export const emptyContainer = (
  <EmptyContainer>
    <img src="/images/not-found.svg" alt=" No proposals to show" />
    <figcaption> No data to show</figcaption>
  </EmptyContainer>
)

export const LendingTab = ({ isLoading }: { isLoading: boolean }) => {
  const {
    loanTokens,
    chartsData: {
      lendBorrow24hDiff: { last24hLending, last24hBorrowing },
    },
  } = useSelector((state: State) => state.loans)

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

  const { lendingSuppliers, borrowers, mostBorrowedAsset, mostLendedAsset, totalCurrentBorrowed, totalCurrentLended } =
    useMemo(() => {
      return loanTokens.reduce<{
        lendingSuppliers: number
        borrowers: number
        mostBorrowedAsset: LoanMarketType['loanTokenData'] | null
        mostLendedAsset: LoanMarketType['loanTokenData'] | null
        prevMostBorrowed: number
        totalCurrentLended: number
        prevMostLended: number
        totalCurrentBorrowed: number
      }>(
        (acc, { suppliers, borrowers, totalBorrowed, totalLended, loanTokenData }) => {
          acc.lendingSuppliers += suppliers
          acc.borrowers += borrowers

          if (acc.prevMostBorrowed < totalBorrowed * loanTokenData.rate) {
            acc.prevMostBorrowed = totalBorrowed * loanTokenData.rate
            acc.mostBorrowedAsset = loanTokenData as LoanMarketType['loanTokenData']
          }

          if (acc.prevMostLended < totalLended * loanTokenData.rate) {
            acc.prevMostLended = totalLended * loanTokenData.rate
            acc.mostLendedAsset = loanTokenData as LoanMarketType['loanTokenData']
          }

          acc.totalCurrentBorrowed += totalBorrowed * loanTokenData.rate
          acc.totalCurrentLended += totalLended * loanTokenData.rate
          return acc
        },
        {
          lendingSuppliers: 0,
          borrowers: 0,
          prevMostBorrowed: 0,
          prevMostLended: 0,
          totalCurrentLended: 0,
          totalCurrentBorrowed: 0,
          mostBorrowedAsset: null,
          mostLendedAsset: null,
        },
      )
    }, [loanTokens])

  const lending24hPersentChange = calcDiffBetweenTwoNumbersInPersentage(
    totalCurrentBorrowed,
    totalCurrentBorrowed - last24hLending,
  )
  const borrowing24hPersentChange = calcDiffBetweenTwoNumbersInPersentage(
    totalCurrentLended,
    totalCurrentLended - last24hBorrowing,
  )

  return (
    <TabWrapperStyled backgroundImage="dashboard_lendingTab_bg.png">
      <div className="top">
        <BGPrimaryTitle>Lending</BGPrimaryTitle>
        <Link to="/loans" className="dashboard-sectionLink">
          <NewButton kind={PRIMARY} form={BUTTON_WIDE}>
            <Icon id="coin-loan" />
            Lending
          </NewButton>
        </Link>
      </div>

      {isLoading ? (
        <DataLoaderWrapper className="tabLoader">
          <ClockLoader width={150} height={150} />
          <div className="text">Loading lending</div>
        </DataLoaderWrapper>
      ) : (
        <LendingContentStyled>
          <div className="left">
            <StatBlock className="large">
              <div className="name">Total Supplied</div>
              <div className="value">
                <CommaNumber beginningText="$" value={totalLended} />
                <div
                  className={`impact ${
                    lending24hPersentChange ? (lending24hPersentChange > 0 ? 'up' : 'down') : 'neutral'
                  }`}
                >
                  <CommaNumber
                    value={lending24hPersentChange}
                    beginningText={lending24hPersentChange > 0 ? '+' : ''}
                    endingText={'% 24h'}
                  />
                </div>
              </div>
            </StatBlock>

            <div className="stats-row">
              <StatBlock>
                <div className="name">Suppliers</div>
                <div className="value">
                  <CommaNumber value={lendingSuppliers} />
                </div>
              </StatBlock>
              <StatBlock>
                <div className="name">24H Supply Vol</div>
                <div className="value">
                  <CommaNumber beginningText="$" value={last24hLending} />
                </div>
              </StatBlock>
              <StatBlock>
                <div className="name">Most Supplied Asset</div>
                <div className="value">
                  {mostLendedAsset?.icon ? (
                    <div className="image-wrapper">
                      <img src={mostLendedAsset.icon} alt="" />
                    </div>
                  ) : (
                    <Icon id="noImage" />
                  )}

                  {mostLendedAsset?.symbol || '-'}
                </div>
              </StatBlock>
            </div>
          </div>
          <div className="spacer" />
          <div className="right">
            <StatBlock className="large">
              <div className="name">Total Borrowed</div>
              <div className="value">
                <CommaNumber beginningText="$" value={totalBorrowed} />
                <div
                  className={`impact ${
                    borrowing24hPersentChange ? (borrowing24hPersentChange > 0 ? 'up' : 'down') : 'neutral'
                  }`}
                >
                  <CommaNumber
                    value={borrowing24hPersentChange}
                    beginningText={borrowing24hPersentChange > 0 ? '+' : ''}
                    endingText={'% 24h'}
                  />
                </div>
              </div>
            </StatBlock>

            <div className="stats-row">
              <StatBlock>
                <div className="name">Borrowers</div>
                <div className="value">
                  <CommaNumber value={borrowers} />
                </div>
              </StatBlock>
              <StatBlock>
                <div className="name">24H Borrow Vol</div>
                <div className="value">
                  <CommaNumber beginningText="$" value={last24hBorrowing} />
                </div>
              </StatBlock>
              <StatBlock>
                <div className="name">Most Borrowed Asset</div>
                <div className="value">
                  {mostBorrowedAsset?.icon ? (
                    <div className="image-wrapper">
                      <img src={mostBorrowedAsset.icon} alt="" />
                    </div>
                  ) : (
                    <Icon id="noImage" />
                  )}

                  {mostBorrowedAsset?.symbol ?? ''}
                </div>
              </StatBlock>
            </div>
          </div>
        </LendingContentStyled>
      )}

      <div className="descr">
        <div className="title">How does Lending work on Mavryk?</div>
        <div className="text">
          Mavryk allows its users to put up existing crypto-assets as collateral for a loan, up to a 50% loan-to-value
          ratio. Likewise, suppliers can loan out their crypto-assets to receive interest.{' '}
          <a href="https://blogs.mavryk.finance/" target="_blank" rel="noreferrer">
            Read More
          </a>
        </div>
      </div>
    </TabWrapperStyled>
  )
}
