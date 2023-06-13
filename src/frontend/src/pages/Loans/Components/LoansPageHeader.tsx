import { useLocation } from 'react-router'
import ConnectWalletInfo from 'app/App.components/ConnectWallet/ConnectWalletBanner'
import Icon from 'app/App.components/Icon/Icon.view'

import {
  PageHeaderForegroundImage,
  PageHeaderForegroundImageContainer,
  PageHeaderStyled,
  PageHeaderTextArea,
} from 'app/App.components/PageHeader/PageHeader.style'

import { ASSETS_WE_HAVE_BG_TO } from '../Loans.const'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'

type MarketPageHeaderPropsType = {
  assetAddress: string
}

export const MarketPageHeader = ({ assetAddress }: MarketPageHeaderPropsType) => {
  const { pathname } = useLocation()
  const isLendingTab = /lendingtab/i.test(pathname)

  const { tokensMetadata } = useTokensContext()

  const { symbol, icon } = tokensMetadata[assetAddress]

  // TODO: handle images we can display in header, by name
  const foregroundImageSrc = ASSETS_WE_HAVE_BG_TO.includes(symbol)
    ? `/images/lending-header-${symbol}.svg`
    : '/images/lending-header.svg'

  return (
    <>
      <PageHeaderStyled backgroundImageSrc={'/images/dapp-header-bg.svg'}>
        <PageHeaderTextArea className="loans">
          <div className="asset-wrapper">
            {icon ? (
              <div className="icon">
                <img src={icon} alt={`${symbol} logo`} />
              </div>
            ) : (
              <Icon id={'noImage'} />
            )}
          </div>
          <div className="text-container">
            <h1>
              {isLendingTab ? 'Earn ' : 'Borrow '}
              {symbol}
            </h1>
            <p>
              {isLendingTab
                ? `Deposit ${symbol} and start earning yield from interest`
                : `Lend and borrow ${symbol} and manage your current ${symbol} positions`}
            </p>
          </div>
        </PageHeaderTextArea>
        <PageHeaderForegroundImageContainer>
          <PageHeaderForegroundImage page={'lending'} src={foregroundImageSrc || '/images/portal.svg'} alt="portal" />
        </PageHeaderForegroundImageContainer>
      </PageHeaderStyled>
      <ConnectWalletInfo />
    </>
  )
}
