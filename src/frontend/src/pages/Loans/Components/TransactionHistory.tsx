
import { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'

import { LoanMarketType } from 'utils/TypesAndInterfaces/Loans'

import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
import { TRANSPARENT } from 'app/App.components/Button/Button.constants'
import {
  TRANSACTION_HISTORY_TABLE_NAME,
  getPageNumber,
  PAGINATION_SIDE_CENTER,
  calculateSlicePositions,
} from 'app/App.components/Pagination/pagination.consts'

import { TransactionHistoryStyled } from '../Loans.style'
import { Table, TableHeader, TableRow, TableHeaderCell, TableBody, TableCell } from 'app/App.components/Table'
import { EmptyContainer } from 'app/App.style'
import Pagination from 'app/App.components/Pagination/Pagination.view'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'


type TransactionHistoryPropsType = {
  currentToken: LoanMarketType | undefined
  vaultAddress: string
}

export const TransactionHistory = ({ currentToken, vaultAddress }: TransactionHistoryPropsType) => {
  const { search } = useLocation()

  const history = useMemo(
    () => currentToken?.transactionHistory.filter((item) => item.vaultAddress === vaultAddress),
    [currentToken?.transactionHistory, vaultAddress],
  )

  const currentPage = getPageNumber(search, TRANSACTION_HISTORY_TABLE_NAME)

  const paginatedTableRows = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, TRANSACTION_HISTORY_TABLE_NAME)
    return history?.slice(from, to)
  }, [currentPage, history])

  return (
    <TransactionHistoryStyled>
      <div className="main">
        <H2Title>Transaction History</H2Title>

        {history?.length ? (
          <>
            <Table className="treasury-table">
              <TableHeader className="simple-header treasury">
                <TableRow>
                  <TableHeaderCell>Description</TableHeaderCell>
                  <TableHeaderCell>Amount</TableHeaderCell>
                  <TableHeaderCell>Date</TableHeaderCell>
                  <TableHeaderCell>User</TableHeaderCell>
                  <TableHeaderCell contentPosition="right">View TX</TableHeaderCell>
                </TableRow>
              </TableHeader>

              <TableBody className="transaction-history">
                {paginatedTableRows?.map(({ descr, amount, date, userAddress, operationHash, tokenSymbol = '' }) => {
                  if (!descr) return null

                  return (
                    <TableRow rowHeight={45} className="add-hover" key={`${operationHash}-${date}`}>
                      <TableCell width={`21%`} className="vert-middle">
                        <span className="descr">{descr}</span>
                      </TableCell>
                      <TableCell width={`21%`}>
                        <CommaNumber value={amount} className="value" endingText={tokenSymbol} />
                      </TableCell>
                      <TableCell width={`28%`}>{date}</TableCell>
                      <TableCell width={`11%`}>
                        <TzAddress tzAddress={userAddress} type={BLUE} />
                      </TableCell>
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
            <figcaption> No Transaction History to show</figcaption>
          </EmptyContainer>
        )}
      </div>

      <Pagination
        itemsCount={history?.length ?? 0}
        listName={TRANSACTION_HISTORY_TABLE_NAME}
        side={PAGINATION_SIDE_CENTER}
      />
    </TransactionHistoryStyled>
  )
}
