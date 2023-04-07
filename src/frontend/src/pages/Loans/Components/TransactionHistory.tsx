import { useState, useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Link, useLocation } from 'react-router-dom'

import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { SlidingTabButtons } from 'app/App.components/SlidingTabButtons/SlidingTabButtons.controller'

import { State } from 'reducers'
import { LoanMarketType } from 'utils/TypesAndInterfaces/Loans'

import { TRANSACTION_HISTORY_SLIDING_BUTTONS } from '../Loans.const'
import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
import { TRANSPARENT } from 'app/App.components/Button/Button.constants'
import {
  TRANSACTION_HISTORY_TABLE_NAME,
  getPageNumber,
  PAGINATION_SIDE_CENTER,
  calculateSlicePositions,
} from 'app/App.components/Pagination/pagination.consts'

import { TransactionHistoryStyled } from '../Loans.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { TzAddress } from 'pages/Treasury/Treasury.style'
import { Table, TableHeader, TableRow, TableHeaderCell, TableBody, TableCell } from 'app/App.components/Table'
import { EmptyContainer } from 'app/App.style'
import Pagination from 'app/App.components/Pagination/Pagination.view'

type TransactionHistoryPropsType = {
  currentToken: LoanMarketType | undefined
}

export const TransactionHistory = ({ currentToken }: TransactionHistoryPropsType) => {
  const { search } = useLocation()
  const { accountPkh } = useSelector((state: State) => state.wallet)

  const [switcherState, setSwitcherState] = useState<'all' | 'personal'>('all')
  const [transactionHistory, setTransactionHistory] = useState<LoanMarketType['transactionHistory'] | undefined>(
    currentToken?.transactionHistory,
  )

  useEffect(() => {
    setTransactionHistory(
      switcherState === 'all'
        ? currentToken?.transactionHistory
        : currentToken?.transactionHistory.filter(({ userAddress }) => accountPkh === userAddress),
    )
  }, [accountPkh, currentToken?.transactionHistory, switcherState])

  const currentPage = getPageNumber(search, TRANSACTION_HISTORY_TABLE_NAME)

  const paginatedTableRows = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, TRANSACTION_HISTORY_TABLE_NAME)
    return transactionHistory?.slice(from, to)
  }, [currentPage, transactionHistory])

  return (
    <TransactionHistoryStyled>
      <div className="top">
        <GovRightContainerTitleArea>
          <h2>Transaction History</h2>
        </GovRightContainerTitleArea>

        <SlidingTabButtons
          onClick={(tabId: number) => setSwitcherState(tabId === 0 ? 'all' : 'personal')}
          tabItems={TRANSACTION_HISTORY_SLIDING_BUTTONS}
          className="transaction-history"
        />
      </div>

      {transactionHistory?.length ? (
        <>
          <Table className="treasury-table">
            <TableHeader className="simple-header treasury">
              <TableRow>
                <TableHeaderCell>Description</TableHeaderCell>
                <TableHeaderCell>Amount</TableHeaderCell>
                <TableHeaderCell>Date</TableHeaderCell>
                <TableHeaderCell>User</TableHeaderCell>
                <TableHeaderCell className="right">View TX</TableHeaderCell>
              </TableRow>
            </TableHeader>

            <TableBody className="transaction-history">
              {paginatedTableRows?.map(({ descr, amount, date, userAddress, operationHash, tokenSymbol = '' }) => {
                if (!descr) return null

                return (
                  <TableRow rowHeight={45} className="add-hover" key={`${operationHash}-${date}`}>
                    <TableCell width={`25%`} className="vert-middle">
                      <span className='descr'>{descr}</span>
                    </TableCell>
                    <TableCell width={`18%`}>
                      <CommaNumber value={amount} className="value" endingText={tokenSymbol} />
                    </TableCell>
                    <TableCell width={`28%`}>{date}</TableCell>
                    <TableCell width={`10%`}>
                      <TzAddress tzAddress={userAddress} type={BLUE} />
                    </TableCell>
                    <TableCell className="buttons right">
                      <div className="cell-content row">
                        <Link to={{ pathname: `https://ghostnet.tzkt.io/${operationHash}` }} target="_blank">
                          <Button text="View TX" kind={TRANSPARENT} className="link" />
                        </Link>
                      </div>
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

      <Pagination
        itemsCount={transactionHistory?.length ?? 0}
        listName={TRANSACTION_HISTORY_TABLE_NAME}
        side={PAGINATION_SIDE_CENTER}
      />
    </TransactionHistoryStyled>
  )
}
