import { useLocation } from 'react-router'
import { useMemo } from 'react'

import { useUserHistoryData } from 'providers/UserProvider/hooks/useUserHistoryData'

import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { Table, TableHeader, TableRow, TableHeaderCell, TableBody, TableCell } from 'app/App.components/Table'
import Pagination from 'app/App.components/Pagination/Pagination.view'

import {
  getPageNumber,
  USER_ACTIONS_HISTORY,
  PAGINATION_SIDE_CENTER,
} from 'app/App.components/Pagination/pagination.consts'

import { HistoryBlock } from './DashboardPersonalComponents.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import { DataLoaderWrapper, SpinnerCircleLoaderStyled } from 'app/App.components/Loader/Loader.style'
import { SPINNER_LOADER_LARGE } from 'app/App.components/Loader/loader.const'

export const UserActionHistory = () => {
  const { isLoading, totalItemsAmount, userActionsHistory } = useUserHistoryData()

  const { search } = useLocation()
  const currentPage = getPageNumber(search, USER_ACTIONS_HISTORY)
  const paginatedTableRows = useMemo(() => userActionsHistory[currentPage] ?? [], [currentPage, userActionsHistory])

  return (
    <HistoryBlock>
      <H2Title>History</H2Title>
      {isLoading ? (
        <DataLoaderWrapper margin="30px 0">
          <SpinnerCircleLoaderStyled className={SPINNER_LOADER_LARGE} />
          <div className="text">Loading your history data</div>
        </DataLoaderWrapper>
      ) : totalItemsAmount ? (
        <Table className="treasury-table">
          <TableHeader className="treasury">
            <TableRow>
              <TableHeaderCell>Action</TableHeaderCell>
              <TableHeaderCell>Amount: MVK</TableHeaderCell>
              <TableHeaderCell>
                Total: MVK{' '}
                <CustomTooltip
                  iconId="info"
                  className="history-tooltip"
                  text='For unstake, this is the amount received in MVK after the fee is deducted. For the rest, same as the "Amount, MVK" column'
                />
              </TableHeaderCell>
              <TableHeaderCell contentPosition="right">Fee</TableHeaderCell>
            </TableRow>
          </TableHeader>

          <TableBody className="treasury">
            {paginatedTableRows.map(({ action, amount, fee, totalAmount, id }) => {
              return (
                <TableRow rowHeight={40} borderColor="dataColor" className="add-hover" key={id}>
                  <TableCell width="25%">{action}</TableCell>
                  <TableCell width="30%">
                    <CommaNumber value={amount} />
                  </TableCell>
                  <TableCell width="30%">
                    <CommaNumber value={totalAmount} />
                  </TableCell>
                  <TableCell width="20%" contentPosition="right">
                    <CommaNumber value={fee} endingText="%" />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      ) : (
        <div className="no-data">
          <span>You do not have any previous actions history</span>
        </div>
      )}

      <Pagination itemsCount={totalItemsAmount} listName={USER_ACTIONS_HISTORY} side={PAGINATION_SIDE_CENTER} />
    </HistoryBlock>
  )
}
