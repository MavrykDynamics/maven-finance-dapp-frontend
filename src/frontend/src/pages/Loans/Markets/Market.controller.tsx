import { ACTION_SIMPLE, TRANSPARENT } from 'app/App.components/Button/Button.constants'
import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import ConnectWalletInfo from 'app/App.components/ConnectWallet/ConnectWalletInfo.view'
import Icon from 'app/App.components/Icon/Icon.view'
import {
  PageHeaderStyled,
  PageHeaderTextArea,
  PageHeaderForegroundImageContainer,
  PageHeaderForegroundImage,
} from 'app/App.components/PageHeader/PageHeader.style'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router'
import { Link } from 'react-router-dom'
import { State } from 'reducers'
import { Page } from 'styles'
import { MarketPagination, MarketStyled } from '../Loans.style'

const loansAssetsBg = ['XTZ', 'EURL', 'USDT']

export const Market = () => {
  const { assetId, tabId } = useParams<{ assetId: string; tabId: string }>()
  const { loanAssets } = useSelector((state: State) => state.loans)
  const foregroundImageSrc = loansAssetsBg.includes(assetId)
    ? `/images/lending-header-${assetId.toUpperCase()}.svg`
    : '/images/lending-header.svg'

  const [prevMarket, nextMarket] = useMemo(() => {
    const currentAssetIdx = loanAssets.findIndex((asset) => asset === assetId)

    return [loanAssets[currentAssetIdx - 1], loanAssets[currentAssetIdx + 1]]
  }, [assetId])

  return (
    <Page>
      <PageHeaderStyled backgroundImageSrc={'/images/dapp-header-bg.svg'}>
        <PageHeaderTextArea>
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
          <Button text="Go Back" icon="arrowRight" kind={TRANSPARENT} className="go-back-btn" />
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
          <div className="info-item">
            <div className="name">Oracle Price</div>
            <div className="value">
              <CommaNumber value={1.4} beginningText="$" />
            </div>
          </div>
          <div className="info-item">
            <div className="name">Total Borrowed</div>
            <div className="value">
              <CommaNumber value={2.1} endingText="m" />
            </div>
          </div>
          <div className="info-item">
            <div className="name">Borrow APY</div>
            <div className="value">
              <CommaNumber value={22.2} endingText="%" />
            </div>
          </div>
          <div className="info-item">
            <div className="name">Available Liquidity</div>
            <div className="value">
              <CommaNumber value={22.2} endingText="m" />
            </div>
          </div>
          <div className="info-item">
            <div className="name">Total Lending</div>
            <div className="value">
              <CommaNumber value={2.2} endingText="m" />
            </div>
          </div>
          <div className="info-item">
            <div className="name">Lending APY</div>
            <div className="value">
              <CommaNumber value={22.2} endingText="%" />
            </div>
          </div>
        </div>

        <div className="tabs-nav">
          <Link to={`/market/${assetId}/lendingTab`}>
            <Button text={'My Lending'} kind={ACTION_SIMPLE} className={`${tabId === 'lendingTab' ? 'active' : ''}`} />
          </Link>
          <Link to={`/market/${assetId}/borrowTab`}>
            <Button text={'My Borrowing'} kind={ACTION_SIMPLE} className={`${tabId === 'borrowTab' ? 'active' : ''}`} />
          </Link>
        </div>
      </MarketStyled>
    </Page>
  )
}
