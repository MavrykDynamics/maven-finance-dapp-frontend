import { useUserHistoryData } from 'providers/UserProvider/hooks/useUserHistoryData'

import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { Table, TableHeader, TableRow, TableHeaderCell, TableBody, TableCell } from 'app/App.components/Table'
import Pagination from 'app/App.components/Pagination/Pagination.view'

import { USER_ACTIONS_HISTORY, PAGINATION_SIDE_CENTER } from 'app/App.components/Pagination/pagination.consts'

import colors from 'styles/colors'
import { HistoryBlock } from './DashboardPersonalComponents.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import { DataLoaderWrapper, SpinnerCircleLoaderStyled } from 'app/App.components/Loader/Loader.style'
import { SPINNER_LOADER_LARGE } from 'app/App.components/Loader/loader.const'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'

export const UserActionHistory = () => {
  const {
    preferences: { themeSelected },
  } = useDappConfigContext()
  const { isLoading, totalItemsAmount, userActionsHistory } = useUserHistoryData()

  return (
    <HistoryBlock>
      <H2Title>History</H2Title>
      {isLoading ? (
        <DataLoaderWrapper className="mt-30 mb-30">
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
                  defaultStrokeColor={colors[themeSelected].mainHeadingText}
                />
              </TableHeaderCell>
              <TableHeaderCell contentPosition="right">Fee</TableHeaderCell>
            </TableRow>
          </TableHeader>

          <TableBody className="treasury">
            {userActionsHistory.map(({ action, amount, fee, totalAmount, id }) => {
              return (
                <TableRow rowHeight={40} borderColor="divider" className="add-hover" key={id}>
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
