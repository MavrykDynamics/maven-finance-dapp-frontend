import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { Redirect, useParams } from 'react-router'
import { Link } from 'react-router-dom'

// const
import { ACTION_SIMPLE, TRANSPARENT_WITH_BORDER } from 'app/App.components/Button/Button.constants'
import { BORROW_TAB_ID, LEND_TAB_ID, PERMISSIONS_VAULTS_TAB_ID } from './Loans.const'

// view
import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { BorrowingTab } from './Components/BorrowingTab'
import { LendingTab } from './Components/LendingTab'
import { SpinnerLoader } from 'app/App.components/Loader/Loader.view'
import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import { TransactionHistory } from './Components/TransactionHistory'

// styles
import { Page } from 'styles'
import { MarketPagination, MarketStyled, ThreeLevelListItem } from './Loans.style'

// types
import { State } from 'reducers'
import { MarketPageHeader } from './Components/LoansPageHeader'
import { PermissionVaults } from './Components/PermissionVaultsTab'
import { LoansModals } from './Components/Modals/Modal.controller'

export const Market = () => {
  const { assetId, tabId } = useParams<{ assetId: string; tabId: string }>()
  const { loanTokens } = useSelector((state: State) => state.loans)
  const { isInitialDataloading } = useSelector((state: State) => state.loading)

  const [showHiddenItems, setShowHiddenItems] = useState(false)

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

  const marketPagination = (
    <MarketPagination>
      <Link to="/loans">
        <Button text="Go Back" icon="arrowRight" className="arrow" kind={TRANSPARENT_WITH_BORDER} />
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
  )

  const tabsNav = (
    <div className="tabs-nav">
      <Link to={`/loans/${assetId}/${LEND_TAB_ID}`}>
        <Button text={'My Lending'} kind={ACTION_SIMPLE} className={`${tabId === LEND_TAB_ID ? 'active' : ''}`} />
      </Link>
      <Link to={`/loans/${assetId}/${BORROW_TAB_ID}`}>
        <Button text={'My Borrowing'} kind={ACTION_SIMPLE} className={`${tabId === BORROW_TAB_ID ? 'active' : ''}`} />
      </Link>
      <Link to={`/loans/${assetId}/${PERMISSIONS_VAULTS_TAB_ID}`}>
        <Button
          text={'Permissions Vaults'}
          kind={ACTION_SIMPLE}
          className={`${tabId === PERMISSIONS_VAULTS_TAB_ID ? 'active' : ''}`}
        />
      </Link>
    </div>
  )

  return (
    <Page>
      <LoansModals />

      <MarketPageHeader assetId={assetId} currentAsset={currentAsset} />

      {marketPagination}

      <MarketStyled>
        <div className="gen-info">
          <div className="asset-info">
            {currentToken.loanTokenData.icon ? (
              <div className="img-wrapper">
                <img src={currentToken.loanTokenData.icon} alt={`${currentToken.loanTokenData.icon} icon`} />
              </div>
            ) : (
              <div className="no-icon">
                <Icon id="noImage" />
              </div>
            )}

            <div className="text-wrapper">
              <div className="symbol">{currentToken.loanTokenData.symbol}</div>
              <div className="full-name">{currentToken.loanTokenData.name}</div>
            </div>
          </div>
          <ThreeLevelListItem>
            <div className="name">Earn APY</div>
            <CommaNumber value={0} endingText="%" className="value" />
          </ThreeLevelListItem>
          <ThreeLevelListItem>
            <div className="name">Total Lending</div>
            <CommaNumber value={0} className="value" />
          </ThreeLevelListItem>
          <ThreeLevelListItem>
            <div className="name">Available Liquidity</div>
            <CommaNumber value={0} className="value" />
          </ThreeLevelListItem>
          <ThreeLevelListItem>
            <div className="name">Collateral Factor</div>
            <CommaNumber value={0} endingText="%" className="value" />
          </ThreeLevelListItem>
          <ThreeLevelListItem>
            <div className="name">Suppliers</div>
            <CommaNumber value={0} className="value" />
          </ThreeLevelListItem>

          <Button
            text="Show More"
            icon="paginationArrowLeft"
            iconAfter
            kind={'transparent'}
            className={`link ${showHiddenItems ? 'arrow-top' : 'arrow-down'}`}
            onClick={() => setShowHiddenItems(!showHiddenItems)}
          />
        </div>

        <div className={`hidden-items ${showHiddenItems ? 'show' : ''}`}>
          <ThreeLevelListItem>
            <div className="name">Oracle Price</div>
            <CommaNumber value={0} beginningText="$" className="value" />
          </ThreeLevelListItem>
          <ThreeLevelListItem>
            <div className="name">Borrow APY</div>
            <CommaNumber value={0} endingText="%" className="value" />
          </ThreeLevelListItem>
          <ThreeLevelListItem>
            <div className="name">Total Borrowed</div>
            <CommaNumber value={0} className="value" />
          </ThreeLevelListItem>
          <ThreeLevelListItem>
            <div className="name">Reserve Amount</div>
            <CommaNumber value={0} className="value" />
          </ThreeLevelListItem>
          <ThreeLevelListItem>
            <div className="name">Reserve Factor</div>
            <CommaNumber value={0} endingText="%" className="value" />
          </ThreeLevelListItem>
          <ThreeLevelListItem>
            <div className="name">Borrowers</div>
            <CommaNumber value={0} className="value" />
          </ThreeLevelListItem>
        </div>

        {tabsNav}

        {tabId === LEND_TAB_ID ? <LendingTab lendingItem={currentToken.lendingItem} /> : null}
        {tabId === BORROW_TAB_ID ? <BorrowingTab borrowingItems={currentToken.myBorrowingList} /> : null}
        {tabId === PERMISSIONS_VAULTS_TAB_ID ? (
          <PermissionVaults permissionVaults={currentToken.permissinedBorrowingList} />
        ) : null}

        <TransactionHistory currentToken={currentToken} />
      </MarketStyled>
    </Page>
  )
}
