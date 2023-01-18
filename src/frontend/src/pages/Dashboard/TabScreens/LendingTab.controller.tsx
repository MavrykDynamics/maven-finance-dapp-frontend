import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { BGPrimaryTitle } from 'pages/BreakGlass/BreakGlass.style'
import { getLoansStorage } from 'pages/Loans/Loans.actions'
import { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { State } from 'reducers'
import { LoanTokenType } from 'utils/TypesAndInterfaces/Loans'
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'
import { StatBlock } from '../Dashboard.style'
import { LendingContentStyled, TabWrapperStyled, EmptyContainer } from './DashboardTabs.style'

export const emptyContainer = (
  <EmptyContainer>
    <img src="/images/not-found.svg" alt=" No proposals to show" />
    <figcaption> No data to show</figcaption>
  </EmptyContainer>
)

export const LendingTab = () => {
  const dispatch = useDispatch()
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { loanTokens, chartsData } = useSelector((state: State) => state.loans)

  const { lendingSuppliers, borrowers, mostBorrowedAsset, mostLendedAsset } = useMemo(() => {
    return loanTokens.reduce<{
      lendingSuppliers: number
      borrowers: number
      mostBorrowedAsset: LoanTokenType['loanTokenData'] | null
      mostLendedAsset: LoanTokenType['loanTokenData'] | null
      prevMostBorrowed: number
      prevMostLended: number
    }>(
      (acc, { suppliers, borrowers, totalBorrowed, totalLended, loanTokenData }) => {
        acc.lendingSuppliers += suppliers
        acc.borrowers += borrowers
        if (acc.prevMostBorrowed < totalBorrowed) {
          acc.prevMostBorrowed = totalBorrowed
          acc.mostBorrowedAsset = loanTokenData as LoanTokenType['loanTokenData']
        }

        if (acc.prevMostLended < totalLended) {
          acc.prevMostLended = totalLended
          acc.mostLendedAsset = loanTokenData as LoanTokenType['loanTokenData']
        }
        return acc
      },
      {
        lendingSuppliers: 0,
        borrowers: 0,
        prevMostBorrowed: 0,
        prevMostLended: 0,
        mostBorrowedAsset: null,
        mostLendedAsset: null,
      },
    )
  }, [loanTokens])

  const { isLoading } = useDataLoader(async () => {
    try {
      await dispatch(getLoansStorage())
    } catch (e) {}
  }, [accountPkh])

  return (
    <TabWrapperStyled backgroundImage="dashboard_lendingTab_bg.png">
      <div className="top">
        <BGPrimaryTitle>Lending</BGPrimaryTitle>
        <Link to="/loans">
          <Button text="Loans" icon="coin-loan" kind={ACTION_PRIMARY} className="noStroke dashboard-sectionLink" />
        </Link>
      </div>

      <LendingContentStyled>
        <div className="left">
          <StatBlock className="large">
            <div className="name">Total Supplied</div>
            <div className="value">
              <CommaNumber beginningText="$" value={chartsData.totalLended} />
              <div className={`impact ${false ? 'up' : 'down'}`}>{false ? '+' : '-'} 27%</div>
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
                <CommaNumber beginningText="$" value={23452342342} />
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

                {mostLendedAsset?.name ?? ''}
              </div>
            </StatBlock>
          </div>
        </div>
        <div className="spacer" />
        <div className="right">
          <StatBlock className="large">
            <div className="name">Total Borrowed</div>
            <div className="value">
              <CommaNumber beginningText="$" value={chartsData.totalBorrowed} />
              <div className={`impact ${true ? 'up' : 'down'}`}>{true ? '+' : '-'} 27%</div>
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
                <CommaNumber beginningText="$" value={23452342342} />
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

                {mostBorrowedAsset?.name ?? ''}
              </div>
            </StatBlock>
          </div>
        </div>
      </LendingContentStyled>

      <div className="descr">
        <div className="title">How does Lending work on Mavyrk?</div>
        <div className="text">
          Mavryk allows its users to put up existing crypto-assets as equity for a stablecoin loan, up to a 50%
          loan-to-value ratio. Likewise, suppliers can loan out their crypto-assets to receive interest.{' '}
          <a href="#">Read more</a>
        </div>
      </div>
    </TabWrapperStyled>
  )
}
