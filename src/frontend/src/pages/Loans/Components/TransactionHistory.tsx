import { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'

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
import { TokenAddressType } from 'providers/TokensProvider/tokens.provider.types'
import { State } from 'reducers'
import { useSelector } from 'react-redux'
import useMarketTransactionHistory from 'providers/LoansProvider/hooks/useMarketTransactionHistory'

type TransactionHistoryPropsType = {
  loanTokenAddress: TokenAddressType
  filterByDescriptions?: number[]
  vaultAddress?: string
  userAddress?: string
  styleType?: typeof PRIMARY_TRANSACTION_HISTORY_STYLE | typeof SECONDARY_TRANSACTION_HISTORY_STYLE
}

/**
 *
 * @param loanTokenAddress - token addres by which take transaction history
 * @param filterByDescriptions - if you want to get a transaction history for certain descriptions, you can specify this option. For ex.: ['Liquidity Added', 'Liquidity Removed'] will be [0, 1] indexer type for descr can get here: getDescrByType
 * @param vaultAddress - if you want to get a transaction history for one vault, you can specify this option.
 * @param userAddress - if you want to get a transaction history for one user, you can specify this option.
 * @param styleType - you can set one of several background options. Use the constant from Loans.const.tsx.
 *
 * TODO: add loader when loading
 */
export const TransactionHistory = ({
  loanTokenAddress,
  filterByDescriptions,
  vaultAddress,
  userAddress,
  styleType = PRIMARY_TRANSACTION_HISTORY_STYLE,
}: TransactionHistoryPropsType) => {
  const { search } = useLocation()

  const {
    lendingController: { address: lendingControllerAddress },
  } = useSelector((state: State) => state.contractAddresses)

  const { isLoading: isTransactionHistoryLoading, transactionHistory } = useMarketTransactionHistory({
    marketTokenAddress: loanTokenAddress,
    userAddress,
    vaultAddress,
    typeFilter: filterByDescriptions,
  })

  const currentPage = getPageNumber(search, TRANSACTION_HISTORY_TABLE_NAME)

  const paginatedTableRows = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, TRANSACTION_HISTORY_TABLE_NAME)
    return transactionHistory.slice(from, to)
  }, [currentPage, transactionHistory])

  return (
    <TransactionHistoryStyled className={styleType}>
      <div className="main">
        <H2Title>Transaction History</H2Title>

        {transactionHistory.length ? (
          <>
            <Table className="treasury-table">
              <TableHeader className="simple-header treasury">
                <TableRow>
                  <TableHeaderCell>Description</TableHeaderCell>
                  <TableHeaderCell>Amount</TableHeaderCell>
                  <TableHeaderCell>Date</TableHeaderCell>
                  <TableHeaderCell contentPosition="right">View TX</TableHeaderCell>
                </TableRow>
              </TableHeader>

              <TableBody className="transaction-history">
                {paginatedTableRows?.map(({ descr, amount, date, operationHash, symbol }) => {
                  if (!descr) return null

                  return (
                    <TableRow rowHeight={45} className="add-hover" key={`${operationHash}-${date}`}>
                      <TableCell width={`30%`} className="vert-middle">
                        <span className="descr">{descr}</span>
                      </TableCell>
                      <TableCell width={`30%`}>
                        <CommaNumber value={amount} className="value" endingText={symbol} />
                      </TableCell>
                      <TableCell width={`30%`}>{date}</TableCell>
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

      <Pagination
        itemsCount={transactionHistory.length}
        listName={TRANSACTION_HISTORY_TABLE_NAME}
        side={PAGINATION_SIDE_CENTER}
      />

      {lendingControllerAddress ? (
        <div className="lending-controller">
          Lending Controller Address: <TzAddress tzAddress={lendingControllerAddress} type={BLUE} isBold />
        </div>
      ) : null}
    </TransactionHistoryStyled>
  )
}
