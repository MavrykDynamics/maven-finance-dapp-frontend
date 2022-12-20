import { TRANSPARENT } from 'app/App.components/Button/Button.constants'
import { Button } from 'app/App.components/Button/Button.controller'
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
import { MarketPagination } from '../Loans.style'

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
    </Page>
  )
}
