import { useMemo } from 'react'
import { Link } from 'react-router'

// consts
import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'

import Button from 'app/App.components/Button/NewButton'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableScrollable,
} from 'app/App.components/Table'
import { LBHInfoBlock } from './DashboardPersonalComponents.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import ConnectWalletBtn from 'app/App.components/ConnectWallet/ConnectWalletBtn'

// hooks
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'

// utils
import { parseDate } from 'utils/time'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'

// context
import { useUserContext } from 'providers/UserProvider/user.provider'
import useUserLoansData from 'providers/UserProvider/hooks/useUserLoansData'

export const LoansTxTab = ({ txVariant }: { txVariant: 'lending' | 'borrowing' }) => {
  const { tokensMetadata } = useTokensContext()
  const { userAddress } = useUserContext()

  const { isLoading: isUserLoansLoading, userLendings, userBorrowings } = useUserLoansData()

  const isLending = txVariant === 'lending'
  const userLoansData = useMemo(
    () => (isLending ? userLendings : userBorrowings),
    [isLending, userBorrowings, userLendings],
  )

  return (
    <LBHInfoBlock>
      <H2Title>{isLending ? 'Earn TXs' : 'Borrow TXs'}</H2Title>

      {isUserLoansLoading ? (
        <div className="loader-wrapper">
          <ClockLoader />
        </div>
      ) : userLoansData.length ? (
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
              {userLoansData.map(({ amount, annualPercentage, operationHash, date, id, tokenAddress }) => {
                const token = getTokenDataByAddress({ tokenAddress, tokensMetadata })
                if (!token) return null

                const { icon, symbol } = token
                return (
                  <TableRow $rowHeight={55} $borderColor="divider" className="add-hover" key={id + operationHash}>
                    <TableCell $width="20%">
                      <div className="cell-content row">
                        <ImageWithPlug useRounded imageLink={icon} alt={`lended asset logo`} />
                        {symbol}
                      </div>
                    </TableCell>
                    <TableCell $width="20%">
                      <CommaNumber value={amount} />
                    </TableCell>
                    <TableCell $width="20%">
                      <CommaNumber value={annualPercentage} endingText="%" />
                    </TableCell>
                    <TableCell $width="30%">
                      {parseDate({ time: date, timeFormat: 'MMM Do, YYYY, HH:mm:ss UTC' })}
                    </TableCell>
                    <TableCell $width="10%" $contentPosition="right">
                      <div style={{ width: 'fit-content' }}>
                        <Link
                          to={`${process.env.REACT_APP_EXPLORER_LINK}/operation/${operationHash}`}
                          target="_blank"
                          className="isCyan"
                        >
                          View TX
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
          {userAddress ? (
            <>
              <span>{isLending ? 'Nothing supplied at this time' : 'Nothing borrowed at this time'}</span>
              <div className="nav-button">
                <Link to="/loans">
                  <Button kind={BUTTON_PRIMARY} form={BUTTON_WIDE}>
                    <Icon id={isLending ? 'lend' : 'borrow'} />
                    {isLending ? 'Supply Asset' : 'Borrow Asset'}
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <ConnectWalletBtn />
          )}
        </div>
      )}
    </LBHInfoBlock>
  )
}
