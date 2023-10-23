import { useLocation } from 'react-router'

// view
import ConnectWalletInfo from 'app/App.components/ConnectWallet/ConnectWalletBanner'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import {
  PageHeaderForegroundImage,
  PageHeaderForegroundImageContainer,
  PageHeaderStyled,
  PageHeaderTextArea,
} from 'app/App.components/PageHeader/PageHeader.style'

// consts
import { ASSETS_WE_HAVE_BG_TO } from '../Loans.const'

// hooks
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'

// utils
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'

type MarketPageHeaderPropsType = {
  assetAddress: string
}

export const MarketPageHeader = ({ assetAddress }: MarketPageHeaderPropsType) => {
  const { pathname } = useLocation()
  const isLendingTab = /lendingtab/i.test(pathname)

  const { tokensMetadata } = useTokensContext()

  const token = getTokenDataByAddress({ tokensMetadata, tokenAddress: assetAddress })
  if (!token) return null

  const { symbol, icon } = token

  const foregroundImageSrc = ASSETS_WE_HAVE_BG_TO.includes(symbol)
    ? `/images/lending-header-${symbol}.svg`
    : '/images/lending-header.svg'

  return (
    <>
      <PageHeaderStyled backgroundImageSrc={'/images/dapp-header-bg.svg'}>
        <PageHeaderTextArea className="loans">
          <div className="asset-wrapper">
            <ImageWithPlug alt={symbol} imageLink={icon} />
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
          <PageHeaderForegroundImage page={'lending'} src={foregroundImageSrc ?? '/images/portal.svg'} alt="portal" />
        </PageHeaderForegroundImageContainer>
      </PageHeaderStyled>
      <ConnectWalletInfo />
    </>
  )
}
