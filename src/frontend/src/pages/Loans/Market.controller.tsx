import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Redirect, useParams } from 'react-router'
import { Link } from 'react-router-dom'

// const
import { ACTION_SIMPLE, TRANSPARENT_WITH_BORDER } from 'app/App.components/Button/Button.constants'
import { BORROW_TAB_ID, LEND_TAB_ID } from './Loans.const'

// view
import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { BorrowingTab } from './Components/BorrowingTab'
import { LendingTab } from './Components/LendingTab'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import { TransactionHistory } from './Components/TransactionHistory'

// styles
import { Page } from 'styles'
import { MarketPagination, MarketStyled, ThreeLevelListItem } from './Loans.style'

// types
import { State } from 'reducers'
import { MarketPageHeader } from './Components/LoansPageHeader'
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { getLoansStorage } from './Actions/getLoansData.actions'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'

export const Market = () => {
  const dispatch = useDispatch()
  const { assetId, tabId } = useParams<{ assetId: string; tabId: string }>()
  const { loanTokens, loansControllerAddress, isDataLoaded } = useSelector((state: State) => state.loans)
  const { accountPkh } = useSelector((state: State) => state.wallet)

  const { isLoading } = useDataLoader(
    async (isDepsChanged) => {
      try {
        if (!isDataLoaded || isDepsChanged) {
          await dispatch(getLoansStorage())
        }
      } catch (e) {}
    },
    [accountPkh],
  )

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const [prevMarket, nextMarket, currentAsset] = useMemo(() => {
    const currentAssetIdx = loanTokens.findIndex(({ loanTokenData: { symbol } }) => symbol === assetId)
    return [
      loanTokens.at(currentAssetIdx - 1) ?? loanTokens.at(-1),
      loanTokens.at(currentAssetIdx + 1) ?? loanTokens.at(0),
      loanTokens.at(currentAssetIdx),
    ]
  }, [assetId, loanTokens])

  if (isLoading) {
    return (
      <Page>
        <PageHeader page={'lending'} />
        <DataLoaderWrapper>
          <ClockLoader width={150} height={150} />
          <div className="text">Loading {assetId} market</div>
        </DataLoaderWrapper>
      </Page>
    )
  }

  if (!currentAsset) {
    return <Redirect to={'/loans'} />
  }

  const marketPagination = (
    <MarketPagination>
      <Link to="/loans">
        <Button text="Go Back" icon="arrowRight" className="arrow" kind={TRANSPARENT_WITH_BORDER} />
      </Link>

      <div className="right-side-wrapper">
        {prevMarket ? (
          <Link to={`/loans/${prevMarket.loanTokenData.symbol}/${tabId}`}>
            <span className="left">
              <Icon id="paginationArrowLeft" /> Previous Market
            </span>
          </Link>
        ) : null}

        {nextMarket ? (
          <Link to={`/loans/${nextMarket.loanTokenData.symbol}/${tabId}`}>
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
    </div>
  )

  return (
    <Page>
      <MarketPageHeader assetId={assetId} currentAsset={currentAsset} />

      {marketPagination}

      <MarketStyled>
        <div className="gen-info">
          <div className="asset-info">
            <ImageWithPlug
              imageLink={currentAsset?.loanTokenData.icon}
              alt={`${currentAsset?.loanTokenData.icon} icon`}
            />

            <div className="text-wrapper">
              <div className="symbol">{currentAsset?.loanTokenData.name}</div>
              <div className="full-name">{currentAsset?.loanTokenData.symbol}</div>
            </div>
          </div>
          {tabId === LEND_TAB_ID ? (
            <>
              <ThreeLevelListItem>
                <div className="name">Oracle Price</div>
                <CommaNumber
                  value={currentAsset.loanTokenData.rate}
                  beginningText="$"
                  className="value"
                  showDecimal
                  decimalsToShow={4}
                />
              </ThreeLevelListItem>
              <ThreeLevelListItem>
                <div className="name">Earn APY</div>
                <CommaNumber value={currentAsset.lendingAPY} endingText="%" className="value" />
              </ThreeLevelListItem>
              <ThreeLevelListItem>
                <div className="name">Total Lending</div>
                <CommaNumber value={currentAsset.totalLended} className="value" />
              </ThreeLevelListItem>
              <ThreeLevelListItem>
                <div className="name">Available Liquidity</div>
                <CommaNumber value={currentAsset.availableLiquidity} className="value" />
              </ThreeLevelListItem>
              <ThreeLevelListItem>
                <div className="name">Collateral Factor</div>
                <CommaNumber value={currentAsset.collateralFactor} endingText="%" className="value" />
              </ThreeLevelListItem>
              <ThreeLevelListItem>
                <div className="name">Suppliers</div>
                <CommaNumber value={currentAsset.suppliers} className="value" />
              </ThreeLevelListItem>
            </>
          ) : (
            <>
              <ThreeLevelListItem>
                <div className="name">Oracle Price</div>
                <CommaNumber
                  value={currentAsset.loanTokenData.rate}
                  beginningText="$"
                  className="value"
                  showDecimal
                  decimalsToShow={4}
                />
              </ThreeLevelListItem>
              <ThreeLevelListItem>
                <div className="name">Borrow APR</div>
                <CommaNumber value={currentAsset.borrowAPR} endingText="%" className="value" />
              </ThreeLevelListItem>
              <ThreeLevelListItem>
                <div className="name">Total Borrowed</div>
                <CommaNumber value={currentAsset.totalBorrowed} className="value" />
              </ThreeLevelListItem>
              <ThreeLevelListItem>
                <div className="name">Reserve Amount</div>
                <CommaNumber value={currentAsset.reserveAmount} className="value" />
              </ThreeLevelListItem>
              <ThreeLevelListItem>
                <div className="name">Reserve Factor</div>
                <CommaNumber value={currentAsset.reserveFactor} endingText="%" className="value" />
              </ThreeLevelListItem>
              <ThreeLevelListItem>
                <div className="name">Borrowers</div>
                <CommaNumber value={currentAsset.borrowers} className="value" />
              </ThreeLevelListItem>
            </>
          )}
        </div>

        {tabsNav}

        {tabId === LEND_TAB_ID ? (
          <LendingTab
            lendingItem={currentAsset.lendingItem}
            lendingControllerAddress={loansControllerAddress}
            assetData={currentAsset.loanTokenData}
            lendAPY={currentAsset.lendingAPY}
          />
        ) : null}
        {tabId === BORROW_TAB_ID ? (
          <BorrowingTab
            borrowingItems={currentAsset.myBorrowingList}
            lendingControllerAddress={loansControllerAddress}
            currentMarketAsset={currentAsset.loanTokenData.gqlName}
          />
        ) : null}

        <TransactionHistory currentToken={currentAsset} />
      </MarketStyled>
    </Page>
  )
}
