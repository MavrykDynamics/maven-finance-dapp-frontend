import { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LoanMarketType } from 'utils/TypesAndInterfaces/Loans'

import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import Pagination from 'app/App.components/Pagination/Pagination.view'

import { PRIMARY_TZ_ADDRESS_COLOR } from 'app/App.components/TzAddress/TzAddress.constants'
import { TRANSPARENT } from 'app/App.components/Button/Button.constants'
import {
  TRANSACTION_HISTORY_TABLE_NAME,
  getPageNumber,
  PAGINATION_SIDE_CENTER,
  calculateSlicePositions,
} from 'app/App.components/Pagination/pagination.consts'
import { PRIMARY_TRANSACTION_HISTORY_STYLE, SECONDARY_TRANSACTION_HISTORY_STYLE } from '../Loans.const'

import { TransactionHistoryStyled } from '../Loans.style'
import { Table, TableHeader, TableRow, TableHeaderCell, TableBody, TableCell } from 'app/App.components/Table'
import { EmptyContainer } from 'app/App.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'

type TransactionHistoryPropsType = {
  transactionHistory: LoanMarketType['transactionHistory']
  filterByDescriptions?: string[]
  vaultAddress?: string
  userAddress?: string
  lendingControllerAddress?: string
  styleType?: typeof PRIMARY_TRANSACTION_HISTORY_STYLE | typeof SECONDARY_TRANSACTION_HISTORY_STYLE
}

/**
 *
 * @param transactionHistory - transaction list, if the array is empty, you get the text "No transaction history to show".
 * @param filterByDescriptions - if you want to get a transaction history for certain descriptions, you can specify this option. For ex.: ['Liquidity Added', 'Liquidity Removed']
 * @param vaultAddress - if you want to get a transaction history for one vault, you can specify this option.
 * @param userAddress - if you want to get a transaction history for one user, you can specify this option.
 * @param lendingControllerAddress - if you want the lending controller addressto appear at the bottom left, you can specify this option.
 * @param styleType - you can set one of several background options. Use the constant from Loans.const.tsx.
 */
export const TransactionHistory = ({
  transactionHistory,
  filterByDescriptions,
  vaultAddress,
  userAddress,
  lendingControllerAddress,
  styleType = PRIMARY_TRANSACTION_HISTORY_STYLE,
}: TransactionHistoryPropsType) => {
  const { search } = useLocation()

  const history = useMemo(() => {
    const historyTransaction =
      vaultAddress || userAddress
        ? transactionHistory.filter((item) => {
            // check if there is description in filters, if there is then skip the condition
            if (
              item.descr &&
              filterByDescriptions &&
              filterByDescriptions.length !== 0 &&
              !filterByDescriptions.includes(item.descr)
            )
              return false

            return (
              (vaultAddress && item.vaultAddress === vaultAddress) || (userAddress && item.userAddress === userAddress)
            )
          })
        : transactionHistory

    return historyTransaction
  }, [filterByDescriptions, transactionHistory, userAddress, vaultAddress])

  const currentPage = getPageNumber(search, TRANSACTION_HISTORY_TABLE_NAME)

  const paginatedTableRows = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, TRANSACTION_HISTORY_TABLE_NAME)
    return history?.slice(from, to)
  }, [currentPage, history])

  return (
    <TransactionHistoryStyled className={styleType}>
      <div className="main">
        <H2Title>Transaction History</H2Title>

        {history.length ? (
          <>
            <Table className="treasury-table">
              <TableHeader className="simple-header treasury">
                <TableRow>
                  <TableHeaderCell>Description</TableHeaderCell>
                  <TableHeaderCell>Amount</TableHeaderCell>
                  <TableHeaderCell>Date</TableHeaderCell>
                  {/* // TODO: remove this and below if it will be unnecessary. Or make it optional */}
                  {/* <TableHeaderCell>User</TableHeaderCell> */}
                  <TableHeaderCell contentPosition="right">View TX</TableHeaderCell>
                </TableRow>
              </TableHeader>

              <TableBody className="transaction-history">
                {paginatedTableRows?.map(({ descr, amount, date, userAddress, operationHash, tokenSymbol = '' }) => {
                  if (!descr) return null

                  return (
                    <TableRow rowHeight={45} className="add-hover" key={`${operationHash}-${date}`}>
                      <TableCell width={`30%`} className="vert-middle">
                        <span className="descr">{descr}</span>
                      </TableCell>
                      <TableCell width={`30%`}>
                        <CommaNumber value={amount} className="value" endingText={tokenSymbol} />
                      </TableCell>
                      <TableCell width={`30%`}>{date}</TableCell>
                      {/* <TableCell width={`11%`}>
                        <TzAddress tzAddress={userAddress} type={BLUE} />
                      </TableCell> */}
                      <TableCell contentPosition="right">
                        <Link to={{ pathname: `https://ghostnet.tzkt.io/${operationHash}` }} target="_blank">
                          <Button text="View TX" kind={TRANSPARENT} className="link" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </>
        ) : (
          <EmptyContainer
            style={{
              padding: '30px 0 20px 0',
            }}
          >
            <img src="/images/not-found.svg" alt=" No Transaction History to show" />
            <figcaption>No Transaction History to show</figcaption>
          </EmptyContainer>
        )}
      </div>

      <Pagination itemsCount={history.length} listName={TRANSACTION_HISTORY_TABLE_NAME} side={PAGINATION_SIDE_CENTER} />

      {lendingControllerAddress ? (
        <div className="lending-controller">
          Lending Controller Address:{' '}
          <TzAddress tzAddress={lendingControllerAddress} type={PRIMARY_TZ_ADDRESS_COLOR} isBold />
        </div>
      ) : null}
    </TransactionHistoryStyled>
  )
}
