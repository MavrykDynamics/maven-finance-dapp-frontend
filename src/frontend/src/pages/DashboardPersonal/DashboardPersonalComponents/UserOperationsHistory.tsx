import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import {
  getPageNumber,
  USER_ACTIONS_HISTORY,
  calculateSlicePositions,
  PAGINATION_SIDE_CENTER,
} from 'app/App.components/Pagination/pagination.consts'
import Pagination from 'app/App.components/Pagination/Pagination.view'
import { Table, TableHeader, TableRow, TableHeaderCell, TableBody, TableCell } from 'app/App.components/Table'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router'
import { State } from 'reducers'
import { HistoryBlock } from './DashboardPersonalComponents.style'

export const UserActionHistory = () => {
  const {
    user: { actionsHistory },
  } = useSelector((state: State) => state.wallet)

  const { search, pathname } = useLocation()
  const currentPage = getPageNumber(search, USER_ACTIONS_HISTORY)
  const paginatedTableRows = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, USER_ACTIONS_HISTORY)
    return actionsHistory?.slice(from, to)
  }, [currentPage, actionsHistory])

  return (
    <HistoryBlock>
      <GovRightContainerTitleArea>
        <h2>History</h2>
      </GovRightContainerTitleArea>
      {actionsHistory.length ? (
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

      <Pagination
        itemsCount={actionsHistory?.length ?? 0}
        listName={USER_ACTIONS_HISTORY}
        side={PAGINATION_SIDE_CENTER}
      />
    </HistoryBlock>
  )
}
