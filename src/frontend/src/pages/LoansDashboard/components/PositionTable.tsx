import { Link } from 'react-router-dom'
import { State } from 'reducers'

import { BORROW_TAB_ID, LEND_TAB_ID } from 'pages/Loans/Loans.const'
import { BUTTON_SIMPLE } from 'app/App.components/Button/Button.constants'

import Button from 'app/App.components/Button/NewButton'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import Icon from 'app/App.components/Icon/Icon.view'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableScrollable,
} from 'app/App.components/Table/Table.style'
import { Plug } from 'app/App.components/Chart/Chart.style'
import { PositionTableStyled } from '../LoansDashboard.styles'
import { useSelector } from 'react-redux'
import colors from 'styles/colors'

export const LoansPositionTable = ({ markets }: { markets: State['loans']['loanTokens'] }) => {
  const { themeSelected } = useSelector((state: State) => state.preferences)

  return (
    <PositionTableStyled>
      {markets.length ? (
        <TableScrollable bodyHeight={210} className="treasury-table loans-position dashboard-loans-table scroll-block">
          <Table>
            <TableHeader className="treasury">
              <TableRow>
                <TableHeaderCell>Asset</TableHeaderCell>
                <TableHeaderCell className="position-multy-cell lending">
                  <div className="cell-content" style={{ marginRight: '20px' }}>
                    <span>
                      Lend APY{' '}
                      {/* <CustomTooltip iconId="info" text="dummy" defaultStrokeColor={colors[themeSelected].textColor} /> */}
                    </span>
                    <span>Total Supplied</span>
                    <span>
                      Yield{' '}
                      {/* <CustomTooltip iconId="info" text="dummy" defaultStrokeColor={colors[themeSelected].textColor} /> */}
                    </span>
                    <span></span>
                  </div>
                </TableHeaderCell>

                <TableHeaderCell className="position-multy-cell borrowing">
                  <div className="cell-content">
                    <span>Borrow APR</span>
                    <span>Loan Balance</span>
                    <span>
                      Vault Status{' '}
                      {/* <CustomTooltip iconId="info" text="dummy" defaultStrokeColor={colors[themeSelected].textColor} /> */}
                    </span>
                    <span></span>
                  </div>
                </TableHeaderCell>
              </TableRow>
            </TableHeader>

            <TableBody className={`treasury dashboard-loans-table`}>
              {markets.concat(markets).map(({ lendingItem, myBorrowingList, loanTokenData, lendingAPY }) => {
                const { lendValue = 0, interestEarned = 0 } = lendingItem ?? {}
                const vaultsData = myBorrowingList.reduce<{ apr: number; loan: number; collateralRatio: number }>(
                  (acc, { apr, borrowedAmount, collateralRatio }) => {
                    acc.apr += apr
                    acc.loan += borrowedAmount
                    acc.collateralRatio += collateralRatio
                    return acc
                  },
                  { apr: 0, loan: 0, collateralRatio: 0 },
                )

                const averageVaultsCollateralRatio = vaultsData.collateralRatio / myBorrowingList.length

                const averageVaultStatus =
                  averageVaultsCollateralRatio >= 200
                    ? { text: 'Low Risk', status: 'low' }
                    : averageVaultsCollateralRatio <= 150
                    ? { text: 'High Risk', status: 'hight' }
                    : { text: 'At Risk', status: 'risk' }
                return (
                  <TableRow rowHeight={60} borderColor="dataColor" className="add-hover" key={loanTokenData.symbol}>
                    <TableCell width="15%">
                      <div className="cell-content row">
                        <ImageWithPlug imageLink={loanTokenData.icon} alt={`${loanTokenData.symbol} logo`} />
                        {loanTokenData.symbol}
                      </div>
                    </TableCell>

                    <TableCell width="43%" className="position-multy-cell lending">
                      <div className="cell-content" style={{ marginRight: '20px' }}>
                        <CommaNumber value={lendingAPY} endingText="%" />
                        <CommaNumber value={lendValue} />
                        <CommaNumber value={interestEarned} />
                        <Link to={`/loans/${loanTokenData.symbol}/${LEND_TAB_ID}`}>
                          <Button kind={BUTTON_SIMPLE}>View</Button>
                        </Link>
                      </div>
                    </TableCell>

                    <TableCell
                      width="41%"
                      className={`position-multy-cell borrowing ${
                        myBorrowingList.length === 0 ? 'create-vault-only' : ''
                      }`}
                    >
                      <div className="cell-content">
                        {myBorrowingList.length ? (
                          <>
                            <CommaNumber value={vaultsData.apr / myBorrowingList.length} endingText="%" />
                            <CommaNumber value={vaultsData.loan / myBorrowingList.length} />
                            <div className={`vault-status ${averageVaultStatus.status}`}>{averageVaultStatus.text}</div>
                            <Link to={`/loans/${loanTokenData.symbol}/${BORROW_TAB_ID}`}>
                              <Button kind={BUTTON_SIMPLE}>View</Button>
                            </Link>
                          </>
                        ) : (
                          <Button kind={BUTTON_SIMPLE}>Create a vault and start borrowing</Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableScrollable>
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
