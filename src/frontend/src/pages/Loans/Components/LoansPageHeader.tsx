import ConnectWalletInfo from 'app/App.components/ConnectWallet/ConnectWalletInfo.view'
import Icon from 'app/App.components/Icon/Icon.view'
import { LoanTokenType } from 'utils/TypesAndInterfaces/Loans'

import {
  PageHeaderForegroundImage,
  PageHeaderForegroundImageContainer,
  PageHeaderStyled,
  PageHeaderTextArea,
} from 'app/App.components/PageHeader/PageHeader.style'

import { ASSETS_WE_HAVE_BG_TO } from '../Loans.const'

type MarketPageHeaderPropsType = {
  currentAsset: LoanTokenType
  assetId: string
}

export const MarketPageHeader = ({ currentAsset, assetId }: MarketPageHeaderPropsType) => {
  // TODO: handle images we can display in header, by name
  const foregroundImageSrc = ASSETS_WE_HAVE_BG_TO.includes(assetId.toUpperCase())
    ? `/images/lending-header-${assetId.toUpperCase()}.svg`
    : '/images/lending-header.svg'

  return (
    <>
      <PageHeaderStyled backgroundImageSrc={'/images/dapp-header-bg.svg'}>
        <PageHeaderTextArea className="loans">
          <div className="asset-wrapper">
            {currentAsset?.loanTokenData?.icon ? (
              <div className="icon">
                <img src={currentAsset.loanTokenData.icon} alt={`${currentAsset.loanTokenData.symbol} logo`} />
              </div>
            ) : (
              <Icon id={'noImage'} />
            )}
          </div>
          <div className="text-container">
            <h1>
              {(currentAsset.loanTokenData.originalName === 'tez'
                ? 'xtz'
                : currentAsset.loanTokenData.originalName
              ).toUpperCase()}{' '}
              Market
            </h1>
            <p>{`Lend and borrow ${assetId} and manage your current ${assetId} positions`}</p>
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
