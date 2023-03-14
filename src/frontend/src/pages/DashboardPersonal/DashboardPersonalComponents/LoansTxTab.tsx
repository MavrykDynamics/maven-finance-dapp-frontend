import { Link } from 'react-router-dom'

import { BUTTON_SIMPLE, BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { State } from 'reducers'

import Button from 'app/App.components/Button/NewButton'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'

import {
  TableScrollable,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
} from 'app/App.components/Table/Table.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { LBHInfoBlock } from './DashboardPersonalComponents.style'
import { parseDate } from 'utils/time'

export const LoansTxTab = ({
  txVariant,
  userLoansData,
  isUserLoansLoading,
}: {
  txVariant: 'lending' | 'borrowing'
  isUserLoansLoading: boolean
  userLoansData: State['wallet']['user']['userLoansData']
}) => {
  const isLending = txVariant === 'lending'
  const dataToShow = isLending ? userLoansData.userLendings : userLoansData.userBorrowing

  return (
    <LBHInfoBlock>
      <GovRightContainerTitleArea>
        <h2>{isLending ? 'Lending TXs' : 'Borrow TXs'}</h2>
      </GovRightContainerTitleArea>

      {isUserLoansLoading ? (
        <div className="loader-wrapper">
          <ClockLoader />
        </div>
      ) : dataToShow.length ? (
        <TableScrollable bodyHeight={230} className="treasury-table dashboard-loans-table scroll-block">
          <Table>
            <TableHeader className="dashboard-loans">
              <TableRow>
                <TableHeaderCell>Asset</TableHeaderCell>
                <TableHeaderCell>Supplied</TableHeaderCell>
                <TableHeaderCell>{isLending ? 'APY' : 'APR/Fee'}</TableHeaderCell>
                <TableHeaderCell>Date</TableHeaderCell>
                <TableHeaderCell contentPosition="right">View TX</TableHeaderCell>
              </TableRow>
            </TableHeader>

            <TableBody className="dashboard-loans treasury">
              {dataToShow.map(({ icon, amount, annualPecentage, operationHash, symbol, date, id }) => {
                return (
                  <TableRow rowHeight={55} borderColor="cardBorderColor" className="add-hover" key={id + operationHash}>
                    <TableCell width="20%">
                      <div className="cell-content row">
                        <ImageWithPlug imageLink={icon} alt={`lended asset logo`} />
                        {symbol}
                      </div>
                    </TableCell>
                    <TableCell width="20%">
                      <CommaNumber value={amount} />
                    </TableCell>
                    <TableCell width="20%">
                      <CommaNumber value={annualPecentage} endingText="%" />
                    </TableCell>
                    <TableCell width="30%">
                      {parseDate({ time: date, timeFormat: 'MMM Do, YYYY, HH:mm:ss UTC' })}
                    </TableCell>
                    <TableCell width="10%" contentPosition="right">
                      <div style={{ width: 'fit-content' }}>
                        <Link to={{ pathname: `https://ghostnet.tzkt.io/${operationHash}` }} target="_blank">
                          <Button kind={BUTTON_SIMPLE}>View TX</Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableScrollable>
      ) : (
        <div className="no-data">
          <span>{isLending ? 'Nothing supplied at this time' : 'Nothing borrowed at this time'}</span>
          <div className="nav-button">
            <Link to="/loans">
              <Button kind={BUTTON_PRIMARY} form={BUTTON_WIDE}>
                <Icon id={isLending ? 'lend' : 'borrow'} />
                {isLending ? 'Lend Asset' : 'Borrow Asset'}
              </Button>
            </Link>
          </div>
        </div>
      )}
    </LBHInfoBlock>
  )
}
