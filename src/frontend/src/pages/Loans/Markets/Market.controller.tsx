import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router'
import { Link } from 'react-router-dom'

// const
import { ACTION_SIMPLE, TRANSPARENT } from 'app/App.components/Button/Button.constants'
import { ASSETS_WE_HAVE_BG_TO, BORROW_TAB_ID, LEND_TAB_ID } from '../Loans.const'

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
import { MarketPagination, MarketStyled, ThreeLevelListItem } from '../Loans.style'

// types
import { State } from 'reducers'
import { BorrowingTab } from '../Components/BorrowingTab'
import { LendingTab } from '../Components/LendingTab'

export const Market = () => {
  const { assetId, tabId } = useParams<{ assetId: string; tabId: string }>()
  const { loanAssets } = useSelector((state: State) => state.loans)

  const foregroundImageSrc = ASSETS_WE_HAVE_BG_TO.includes(assetId)
    ? `/images/lending-header-${assetId.toUpperCase()}.svg`
    : '/images/lending-header.svg'

  const [prevMarket, nextMarket] = useMemo(() => {
    const currentAssetIdx = loanAssets.findIndex((asset) => asset === assetId)
    return [loanAssets[currentAssetIdx - 1], loanAssets[currentAssetIdx + 1]]
  }, [assetId, loanAssets])

  return (
    <Page>
      <PageHeaderStyled backgroundImageSrc={'/images/dapp-header-bg.svg'}>
        <PageHeaderTextArea className="loans">
          {assetId && (
            <div className="asset-wrapper">
              <Icon id={'xtzTezos'} />
            </div>
          )}
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
            <Link to={`/market/${prevMarket}/${tabId}`}>
              <span className="left">
                <Icon id="paginationArrowLeft" /> Previous Market
              </span>
            </Link>
          ) : null}

          {nextMarket ? (
            <Link to={`/market/${nextMarket}/${tabId}`}>
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
      </MarketStyled>
    </Page>
  )
}
