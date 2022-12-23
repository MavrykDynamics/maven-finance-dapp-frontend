import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useLocation, useParams } from 'react-router'
import { Link } from 'react-router-dom'

// const
import { ACTION_SIMPLE, TRANSPARENT } from 'app/App.components/Button/Button.constants'
import {
  ASSETS_WE_HAVE_BG_TO,
  BORROW_TAB_ID,
  COLLATERAL_MOCK,
  LEND_TAB_ID,
  TRANSACTION_HISTORY_MOCK,
  TRANSACTION_HISTORY_SLIDING_BUTTONS,
} from '../Loans.const'

// view
import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import ConnectWalletInfo from 'app/App.components/ConnectWallet/ConnectWalletInfo.view'
import Icon from 'app/App.components/Icon/Icon.view'

// styles
import {
  PageHeaderStyled,
  PageHeaderTextArea,
  PageHeaderForegroundImageContainer,
  PageHeaderForegroundImage,
} from 'app/App.components/PageHeader/PageHeader.style'
import { Page } from 'styles'
import { MarketPagination, MarketStyled, ThreeLevelListItem, TransactionHistory } from '../Loans.style'

// types
import { State } from 'reducers'
import { BorrowingTab } from './BorrowingTab'
import { LendingTab } from './LendingTab'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { SlidingTabButtons } from 'app/App.components/SlidingTabButtons/SlidingTabButtons.controller'
import {
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
} from 'app/App.components/Table/Table.style'
import { parseDate } from 'utils/time'
import { TzAddress } from 'pages/Treasury/Treasury.style'
import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
import { Pagination } from 'pages/BreakGlass/BreakGlass.style'
import {
  calculateSlicePositions,
  PAGINATION_SIDE_CENTER,
  TRANSACTION_HISTORY_TABLE_NAME,
} from 'pages/FinacialRequests/Pagination/pagination.consts'
import { getPageNumber } from 'pages/FinacialRequests/FinancialRequests.helpers'

export const Market = () => {
  const { search } = useLocation()
  const { assetId, tabId } = useParams<{ assetId: string; tabId: string }>()
  const { loanTokens } = useSelector((state: State) => state.loans)

  const foregroundImageSrc = ASSETS_WE_HAVE_BG_TO.includes(assetId)
    ? `/images/lending-header-${assetId.toUpperCase()}.svg`
    : '/images/lending-header.svg'

  const [prevMarket, nextMarket, currentAsset] = useMemo(() => {
    const currentAssetIdx = loanTokens.findIndex(({ loanTokenData: { symbol } }) => symbol === assetId)
    return [loanTokens[currentAssetIdx - 1], loanTokens[currentAssetIdx + 1], loanTokens[currentAssetIdx]]
  }, [assetId, loanTokens])

  const currentPage = getPageNumber(search, TRANSACTION_HISTORY_TABLE_NAME)

  const paginatedTableRows = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, TRANSACTION_HISTORY_TABLE_NAME)
    return TRANSACTION_HISTORY_MOCK?.slice(from, to)
  }, [currentPage, TRANSACTION_HISTORY_MOCK])

  return (
    <Page>
      <PageHeaderStyled backgroundImageSrc={'/images/dapp-header-bg.svg'}>
        <PageHeaderTextArea className="loans">
          <div className="asset-wrapper">
            {currentAsset.loanTokenData.icon ? (
              <div className="icon">
                <img src={currentAsset.loanTokenData.icon} alt={`${currentAsset.loanTokenData.symbol} logo`} />
              </div>
            ) : (
              <Icon id={'noIcon'} />
            )}
          </div>
          <div className="text-container">
            <h1>{assetId.toUpperCase()} Market</h1>
            <p>{`Lend and borrow ${assetId} and manage your current ${assetId} positions`}</p>
          </div>
        </PageHeaderTextArea>
        <PageHeaderForegroundImageContainer>
          <PageHeaderForegroundImage page={'lending'} src={foregroundImageSrc || '/images/portal.svg'} alt="portal" />
        </PageHeaderForegroundImageContainer>
      </PageHeaderStyled>
      <ConnectWalletInfo />

      <MarketPagination>
        <Link to="/loans">
          <Button text="Go Back" icon="arrowRight" kind={TRANSPARENT} className="go-back-btn loans" />
        </Link>

        <div className="right-side-wrapper">
          {prevMarket ? (
            <Link to={`/market/${prevMarket.loanTokenData.symbol}/${tabId}`}>
              <span className="left">
                <Icon id="paginationArrowLeft" /> Previous Market
              </span>
            </Link>
          ) : null}

          {nextMarket ? (
            <Link to={`/market/${nextMarket.loanTokenData.symbol}/${tabId}`}>
              <span className="right">
                Next Market
                <Icon id="paginationArrowLeft" />
              </span>
            </Link>
          ) : null}
        </div>
      </MarketPagination>

      <MarketStyled>
        <div className="gen-info">
          <div className="asset-info">
            <Icon id="xtzTezos" />
            <div className="text-wrapper">
              <div className="symbol">XTZ</div>
              <div className="full-name">Tezos</div>
            </div>
          </div>
          <ThreeLevelListItem>
            <div className="name">Oracle Price</div>
            <CommaNumber value={1.4} beginningText="$" className="value" />
          </ThreeLevelListItem>
          <ThreeLevelListItem>
            <div className="name">Total Borrowed</div>
            <CommaNumber value={2.1} endingText="m" className="value" />
          </ThreeLevelListItem>
          <ThreeLevelListItem>
            <div className="name">Borrow APY</div>
            <CommaNumber value={22.2} endingText="%" className="value" />
          </ThreeLevelListItem>
          <ThreeLevelListItem>
            <div className="name">Available Liquidity</div>
            <CommaNumber value={22.2} endingText="m" className="value" />
          </ThreeLevelListItem>
          <ThreeLevelListItem>
            <div className="name">Total Lending</div>
            <CommaNumber value={2.2} endingText="m" className="value" />
          </ThreeLevelListItem>
          <ThreeLevelListItem>
            <div className="name">Lending APY</div>
            <CommaNumber value={22.2} endingText="%" className="value" />
          </ThreeLevelListItem>
        </div>

        <div className="tabs-nav">
          <Link to={`/market/${assetId}/${LEND_TAB_ID}`}>
            <Button text={'My Lending'} kind={ACTION_SIMPLE} className={`${tabId === LEND_TAB_ID ? 'active' : ''}`} />
          </Link>
          <Link to={`/market/${assetId}/${BORROW_TAB_ID}`}>
            <Button
              text={'My Borrowing'}
              kind={ACTION_SIMPLE}
              className={`${tabId === BORROW_TAB_ID ? 'active' : ''}`}
            />
          </Link>
        </div>
        {tabId === LEND_TAB_ID ? <LendingTab lendingItems={[]} /> : <BorrowingTab borrowingItems={[]} />}

        <TransactionHistory>
          <div className="top">
            <GovRightContainerTitleArea>
              <h2>Transaction History</h2>
            </GovRightContainerTitleArea>

            <SlidingTabButtons onClick={(tabId: number) => null} tabItems={TRANSACTION_HISTORY_SLIDING_BUTTONS} />
          </div>

          {TRANSACTION_HISTORY_MOCK.length ? (
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
                  {paginatedTableRows.map(() => {
                    return (
                      <TableRow rowHeight={45} className="add-hover" borderColor="dataColor">
                        <TableCell width={`20%`} className="vert-middle">
                          <span>Liquidity Added</span>
                        </TableCell>
                        <TableCell width={`15%`}>
                          <CommaNumber value={22.2} className="value" endingText="XTZ" />
                        </TableCell>
                        <TableCell width={`30%`}>
                          {parseDate({ time: Date.now(), timeFormat: 'MMM Do, YYYY, HH:mm:ss UTC' })}
                        </TableCell>
                        <TableCell width={`15%`}>
                          <TzAddress tzAddress="tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD" type={BLUE} />
                        </TableCell>
                        <TableCell className="buttons right">
                          <div className="cell-content row">
                            <Button text="View TX" kind={TRANSPARENT} className="link" />
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </>
          ) : null}

          <Pagination
            itemsCount={TRANSACTION_HISTORY_MOCK.length}
            listName={TRANSACTION_HISTORY_TABLE_NAME}
            side={PAGINATION_SIDE_CENTER}
          />
        </TransactionHistory>
      </MarketStyled>
    </Page>
  )
}
