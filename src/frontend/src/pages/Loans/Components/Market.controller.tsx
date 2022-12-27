import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Redirect, useParams } from 'react-router'
import { Link } from 'react-router-dom'

// const
import { ACTION_SIMPLE, TRANSPARENT } from 'app/App.components/Button/Button.constants'
import { BORROW_TAB_ID, LEND_TAB_ID, PERMISSIONS_VAULTS_TAB_ID } from '../Loans.const'

// view
import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { BorrowingTab } from './BorrowingTab'
import { LendingTab } from './LendingTab'
import { SpinnerLoader } from 'app/App.components/Loader/Loader.view'
import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import { TransactionHistory } from './TransactionHistory'

// styles
import { Page } from 'styles'
import { MarketPagination, MarketStyled, ThreeLevelListItem } from '../Loans.style'

// types
import { State } from 'reducers'
import { MarketPageHeader } from './LoansPageHeader'
import { PermissionVaults } from './PermissionVaultsTab'

export const Market = () => {
  const { assetId, tabId } = useParams<{ assetId: string; tabId: string }>()
  const { loanTokens } = useSelector((state: State) => state.loans)
  const { isInitialDataloading } = useSelector((state: State) => state.loading)

  const currentToken = useMemo(() => loanTokens.find(({ loanTokenData: { symbol } }) => assetId === symbol), [assetId])

  const [prevMarket, nextMarket, currentAsset] = useMemo(() => {
    const currentAssetIdx = loanTokens.findIndex(({ loanTokenData: { symbol } }) => symbol === assetId)
    return [loanTokens[currentAssetIdx - 1], loanTokens[currentAssetIdx + 1], loanTokens[currentAssetIdx]]
  }, [assetId, loanTokens])

  // TODO: add loader to the page, if data is not loaded, need to create dataLoaderHook
  if (isInitialDataloading) {
    return (
      <Page>
        <PageHeader page={'lending'} />
        <SpinnerLoader />
      </Page>
    )
  }

  if (!currentToken) {
    return <Redirect to={'/loans'} />
  }

  return (
    <Page>
      <MarketPageHeader assetId={assetId} currentAsset={currentAsset} />

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
            {currentToken.loanTokenData.icon ? (
              <div className="img-wrapper">
                <img src={currentToken.loanTokenData.icon} alt={`${currentToken.loanTokenData.icon} icon`} />
              </div>
            ) : (
              <Icon id="xtzTezos" />
            )}

            <div className="text-wrapper">
              <div className="symbol">{currentToken.loanTokenData.symbol}</div>
              <div className="full-name">{currentToken.loanTokenData.name}</div>
            </div>
          </div>
          <ThreeLevelListItem>
            <div className="name">Oracle Price</div>
            <CommaNumber value={1.4} beginningText="$" className="value" />
          </ThreeLevelListItem>
          <ThreeLevelListItem>
            <div className="name">Total Borrowed</div>
            <CommaNumber value={currentToken.totalBorrowed} showLetter className="value" />
          </ThreeLevelListItem>
          <ThreeLevelListItem>
            <div className="name">Borrow APY</div>
            <CommaNumber value={22.2} endingText="%" className="value" />
          </ThreeLevelListItem>
          <ThreeLevelListItem>
            <div className="name">Available Liquidity</div>
            <CommaNumber value={currentToken.avaliableLiquidity} showLetter className="value" />
          </ThreeLevelListItem>
          <ThreeLevelListItem>
            <div className="name">Total Lending</div>
            <CommaNumber value={currentToken.totalLended} showLetter className="value" />
          </ThreeLevelListItem>
          <ThreeLevelListItem>
            <div className="name">Lending APY</div>
            <CommaNumber value={22.2} endingText="%" className="value" />
          </ThreeLevelListItem>
        </div>

        <div className="tabs-nav">
          <Link to={`/loans/${assetId}/${LEND_TAB_ID}`}>
            <Button text={'My Lending'} kind={ACTION_SIMPLE} className={`${tabId === LEND_TAB_ID ? 'active' : ''}`} />
          </Link>
          <Link to={`/loans/${assetId}/${BORROW_TAB_ID}`}>
            <Button
              text={'My Borrowing'}
              kind={ACTION_SIMPLE}
              className={`${tabId === BORROW_TAB_ID ? 'active' : ''}`}
            />
          </Link>
          <Link to={`/loans/${assetId}/${PERMISSIONS_VAULTS_TAB_ID}`}>
            <Button
              text={'Permissions Vaults'}
              kind={ACTION_SIMPLE}
              className={`${tabId === PERMISSIONS_VAULTS_TAB_ID ? 'active' : ''}`}
            />
          </Link>
        </div>

        {tabId === LEND_TAB_ID ? <LendingTab lendingItems={[]} /> : null}
        {tabId === BORROW_TAB_ID ? <BorrowingTab borrowingItems={[]} /> : null}
        {tabId === PERMISSIONS_VAULTS_TAB_ID ? <PermissionVaults permissionVaults={[]} /> : null}

        <TransactionHistory currentToken={currentToken} />
      </MarketStyled>
    </Page>
  )
}
