import { useContext, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { State } from 'reducers'

import { BORROW_TAB_ID, LEND_TAB_ID } from 'pages/Loans/Loans.const'
import colors from 'styles/colors'
import {
  calculateSlicePositions,
  getPageNumber,
  LOANS_POSITION_TABLE,
  PAGINATION_SIDE_CENTER,
} from 'app/App.components/Pagination/pagination.consts'
import { BUTTON_SIMPLE } from 'app/App.components/Button/Button.constants'

import Button from 'app/App.components/Button/NewButton'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import Icon from 'app/App.components/Icon/Icon.view'
import Pagination from 'app/App.components/Pagination/Pagination.view'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'

import { Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from 'app/App.components/Table'
import { Plug } from 'app/App.components/Chart/Chart.style'
import { PositionTableStyled } from '../LoansDashboard.styles'
import { loansPopupsContext } from 'pages/Loans/Components/Modals/LoansModals.provider'
import { getGaugeVaultRiskSimpleStatus, getVaultSimpleStatus } from '../helpers/position.helpers'

export const LoansPositionTable = ({
  markets,
  userVaultsData,
}: {
  markets: State['loans']['loanTokens']
  userVaultsData: State['wallet']['user']['userLoansData']['userVaultsData']
}) => {
  const { themeSelected } = useSelector((state: State) => state.preferences)
  const { openCreateVaultPopup, openAddLendingAssetPopup } = useContext(loansPopupsContext)

  const { search, pathname } = useLocation()
  const currentPage = getPageNumber(search, LOANS_POSITION_TABLE)
  const paginatedTableRows = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, LOANS_POSITION_TABLE)
    return markets?.slice(from, to)
  }, [currentPage, markets])

  return (
    <PositionTableStyled>
      {markets.length ? (
        <>
          <Table className="treasury-table">
            <TableHeader className="treasury">
              <TableRow>
                <TableHeaderCell>Asset</TableHeaderCell>
                <TableHeaderCell className="position-multy-cell lending">
                  <div className="cell-content" style={{ marginRight: '20px' }}>
                    <span>
                      Lend APY{' '}
                      <CustomTooltip
                        iconId="info"
                        text="Current yield suppliers are earning on their deposits."
                        defaultStrokeColor={colors[themeSelected].textColor}
                      />
                    </span>
                    <span>Total Supplied</span>
                    <span>
                      Yield{' '}
                      <CustomTooltip
                        iconId="info"
                        text="Rewards To Date"
                        defaultStrokeColor={colors[themeSelected].textColor}
                      />
                    </span>
                    <span></span>
                  </div>
                </TableHeaderCell>

                <TableHeaderCell className="position-multy-cell borrowing">
                  <div className="cell-content">
                    <span>Borrow APR</span>
                    <span>Loan Balance</span>
                    <span>
                      Vault Status
                      {/* <CustomTooltip iconId="info" text="dummy" defaultStrokeColor={colors[themeSelected].textColor} /> */}
                    </span>
                    <span></span>
                  </div>
                </TableHeaderCell>
              </TableRow>
            </TableHeader>

            <TableBody className={`treasury dashboard-loans-table`}>
              {paginatedTableRows.map(({ lendingItem, myBorrowingList, loanTokenData, borrowAPR, lendingAPY }) => {
                const { lendValue = 0, interestEarned = 0 } = lendingItem ?? {}

                const marketVaultsUserData = userVaultsData[loanTokenData.gqlName.toLowerCase()]

                const averageVaultStatus = getGaugeVaultRiskSimpleStatus(
                  marketVaultsUserData
                    ? (marketVaultsUserData.borrowedAmount / (marketVaultsUserData.collateralAmount / 2)) * 100
                    : 0,
                )

                return (
                  <TableRow
                    rowHeight={60}
                    borderColor="cardBorderColor"
                    className="add-hover"
                    key={loanTokenData.symbol}
                  >
                    <TableCell width="15%">
                      <div className="cell-content row with-icon asset-name">
                        <ImageWithPlug imageLink={loanTokenData.icon} alt={`${loanTokenData.symbol} logo`} />
                        {loanTokenData.symbol}
                      </div>
                    </TableCell>

                    <TableCell width="43%" className={`position-multy-cell lending ${!lendingItem ? 'one-item' : ''}`}>
                      <div className="cell-content" style={{ marginRight: '20px' }}>
                        {lendingItem ? (
                          <>
                            <CommaNumber value={lendingAPY} endingText="%" />
                            <CommaNumber value={lendValue} />
                            <CommaNumber value={interestEarned} />
                            <Link to={`/loans/${loanTokenData.symbol}/${LEND_TAB_ID}`}>
                              <Button kind={BUTTON_SIMPLE}>View</Button>
                            </Link>
                          </>
                        ) : (
                          <Link to={`/loans/${loanTokenData.symbol}/${LEND_TAB_ID}`}>
                            <Button
                              kind={BUTTON_SIMPLE}
                              onClick={() => {
                                openAddLendingAssetPopup({
                                  mBalance: 0,
                                  lendingAPY: lendingAPY,
                                  ...loanTokenData,
                                })
                              }}
                            >
                              Supply {loanTokenData.symbol} and start Earning
                            </Button>
                          </Link>
                        )}
                      </div>
                    </TableCell>

                    <TableCell
                      width="41%"
                      className={`position-multy-cell borrowing ${myBorrowingList.length === 0 ? 'one-item' : ''}`}
                    >
                      <div className="cell-content">
                        {marketVaultsUserData ? (
                          <>
                            <CommaNumber value={borrowAPR} endingText="%" />
                            <CommaNumber value={marketVaultsUserData.borrowedAmount} />
                            <div className={`vault-status ${averageVaultStatus.status}`}>{averageVaultStatus.text}</div>
                            <Link to={`/loans/${loanTokenData.symbol}/${BORROW_TAB_ID}`}>
                              <Button kind={BUTTON_SIMPLE}>View</Button>
                            </Link>
                          </>
                        ) : (
                          <Link to={`/loans/${loanTokenData.symbol}/${BORROW_TAB_ID}`}>
                            <Button
                              kind={BUTTON_SIMPLE}
                              onClick={() =>
                                openCreateVaultPopup({
                                  currentMarketAsset: loanTokenData.symbol,
                                })
                              }
                            >
                              Create a vault and start borrowing
                            </Button>
                          </Link>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          <Pagination itemsCount={markets?.length ?? 0} listName={LOANS_POSITION_TABLE} side={PAGINATION_SIDE_CENTER} />
        </>
      ) : (
        <Plug className={'no-markets-table-data'}>
          <div>
            <Icon id="stars" className="icon-stars" />
            <Icon id="cow" className="icon-cow" />
          </div>

          <p>There is not active markets</p>
        </Plug>
      )}
    </PositionTableStyled>
  )
}
