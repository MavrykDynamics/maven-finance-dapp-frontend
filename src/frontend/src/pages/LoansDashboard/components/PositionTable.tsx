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
import { getGaugeVaultRiskSimpleStatus } from '../helpers/position.helpers'
import ConnectWalletBtn from 'app/App.components/ConnectWallet/ConnectWalletBtn'
import { UserLoansDataStateType } from 'providers/UserProvider/helpers/user.types'
import { useLoansPopupsContext } from 'providers/LoansProvider/LoansModals.provider'
import { getMarketUserLengingItem } from 'providers/LoansProvider/helpers/loans.utils'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'

export const LoansPositionTable = ({
  markets,
  userVaultsData,
}: {
  markets: State['loans']['loanTokens']
  userVaultsData: UserLoansDataStateType['userVaultsData']
}) => {
  const { openCreateVaultPopup, openAddLendingAssetPopup } = useLoansPopupsContext()
  const { tokensMetadata, tokensPrices } = useTokensContext()

  const { themeSelected } = useSelector((state: State) => state.preferences)
  const {
    accountPkh,
    user: { userMTokens },
  } = useSelector((state: State) => state.wallet)

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

            {accountPkh ? (
              <TableBody className={`treasury dashboard-loans-table`}>
                {paginatedTableRows.map(({ loanMTokenAddress, loanTokenAddress, borrowAPR, lendingAPY }) => {
                  const { lendValue = 0, interestEarned = 0 } =
                    getMarketUserLengingItem(userMTokens, loanMTokenAddress) ?? {}

                  const { symbol, icon } = tokensMetadata[loanTokenAddress]
                  const rate = tokensPrices[symbol]

                  const marketVaultsUserData = userVaultsData[loanTokenAddress]

                  const averageVaultStatus = getGaugeVaultRiskSimpleStatus(
                    marketVaultsUserData?.collateralAmount
                      ? (marketVaultsUserData.borrowedAmount / (marketVaultsUserData.collateralAmount / 2)) * 100
                      : 0,
                  )

                  return (
                    <TableRow rowHeight={60} borderColor="cardBorderColor" className="add-hover" key={symbol}>
                      <TableCell width="15%">
                        <div className="cell-content row with-icon asset-name">
                          <ImageWithPlug imageLink={icon} alt={`${symbol} logo`} />
                          {symbol}
                        </div>
                      </TableCell>

                      <TableCell
                        width="43%"
                        className={`position-multy-cell lending ${!loanMTokenAddress ? 'one-item' : ''}`}
                      >
                        <div className="cell-content" style={{ marginRight: '20px' }}>
                          {loanMTokenAddress ? (
                            <>
                              <CommaNumber value={lendingAPY} endingText="%" />
                              <CommaNumber value={lendValue * rate} beginningText="$" />
                              <CommaNumber value={interestEarned} />
                              <Link to={`/loans/${symbol}/${LEND_TAB_ID}`}>
                                <Button kind={BUTTON_SIMPLE}>View</Button>
                              </Link>
                            </>
                          ) : (
                            <Link to={`/loans/${symbol}/${LEND_TAB_ID}`}>
                              <Button
                                kind={BUTTON_SIMPLE}
                                onClick={() => {
                                  openAddLendingAssetPopup({
                                    mBalance: 0,
                                    lendingAPY: lendingAPY,
                                    tokenAddress: loanTokenAddress,
                                  })
                                }}
                              >
                                Supply {symbol} and start Earning
                              </Button>
                            </Link>
                          )}
                        </div>
                      </TableCell>

                      <TableCell
                        width="41%"
                        className={`position-multy-cell borrowing ${!marketVaultsUserData ? 'one-item' : ''}`}
                      >
                        <div className="cell-content">
                          {marketVaultsUserData ? (
                            <>
                              <CommaNumber value={borrowAPR} endingText="%" />
                              <CommaNumber value={marketVaultsUserData.borrowedAmount} beginningText="$" />
                              <div className={`vault-status ${averageVaultStatus.status}`}>
                                {averageVaultStatus.text}
                              </div>
                              <Link to={`/loans/${symbol}/${BORROW_TAB_ID}`}>
                                <Button kind={BUTTON_SIMPLE}>View</Button>
                              </Link>
                            </>
                          ) : (
                            <Link to={`/loans/${symbol}/${BORROW_TAB_ID}`}>
                              <Button
                                kind={BUTTON_SIMPLE}
                                onClick={() =>
                                  openCreateVaultPopup({
                                    tokenAddress: loanTokenAddress,
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
            ) : (
              <TableBody>
                <TableRow rowHeight={1}>
                  <TableCell width="15%" />
                  <TableCell width="43%" />
                  <TableCell width="41%" />
                </TableRow>
              </TableBody>
            )}
          </Table>

          {accountPkh ? null : (
            <div className="not-connected">
              <ConnectWalletBtn />
            </div>
          )}

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
