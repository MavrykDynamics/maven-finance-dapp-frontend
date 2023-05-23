import { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LoanMarketType } from 'utils/TypesAndInterfaces/Loans'

import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import Pagination from 'app/App.components/Pagination/Pagination.view'

import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
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
  currentToken?: LoanMarketType
  vaultAddress?: string
  lendingControllerAddress?: string
  styleType?: typeof PRIMARY_TRANSACTION_HISTORY_STYLE | typeof SECONDARY_TRANSACTION_HISTORY_STYLE
}

export const TransactionHistory = ({
  currentToken,
  vaultAddress,
  lendingControllerAddress,
  styleType = PRIMARY_TRANSACTION_HISTORY_STYLE,
}: TransactionHistoryPropsType) => {
  const { search } = useLocation()

  const history = useMemo(() => {
    const historyTransaction = vaultAddress
      ? currentToken?.transactionHistory.filter((item) => item.vaultAddress === vaultAddress)
      : currentToken?.transactionHistory

    return historyTransaction || []
  }, [currentToken?.transactionHistory, vaultAddress])
  console.log(styleType)

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

      {lendingControllerAddress ? (
        <div className="lending-controller">
          Lending Controller Address: <TzAddress tzAddress={lendingControllerAddress} type={BLUE} />
        </div>
      ) : null}
    </TransactionHistoryStyled>
  )
}
