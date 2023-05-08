import { useDispatch, useSelector } from 'react-redux'
import { useMedia } from 'react-use'
import { useHistory, useLocation } from 'react-router-dom'
import { useState } from 'react'

import { State } from '../../../reducers'
import { BUTTON_PRIMARY, BUTTON_SECONDARY, BUTTON_SIMPLE, BUTTON_WIDE } from '../Button/Button.constants'
import { BLUE } from '../TzAddress/TzAddress.constants'
import { MVK_TOKEN_SYMBOL, XTZ_TOKEN_SYMBOL, SMVK_TOKEN_SYMBOL } from 'utils/constants'
import { changeWallet, disconnect } from './ConnectWallet.actions'

import Icon from '../Icon/Icon.view'
import { TzAddress } from '../TzAddress/TzAddress.view'
import Button from '../Button/NewButton'
import { CommaNumber } from '../CommaNumber/CommaNumber.controller'
import { WalletDetailsHiddenPart, WalletDetailsStyled, WalletDetailsVisiblePart } from './ConnectWallet.style'

type ConnectWalletProps = {
  className?: string
  closeMobileMenu?: (e: React.MouseEvent<HTMLElement>) => void
  mountWertWiget: (commodity: string) => void
}

export const WalletDetails = ({ closeMobileMenu, mountWertWiget }: ConnectWalletProps) => {
  const dispatch = useDispatch()
  const history = useHistory()
  const {
    accountPkh,
    user: { userTokens },
  } = useSelector((state: State) => state.wallet)
  const { tokensPrices } = useSelector((state: State) => state.tokens)

  const { pathname } = useLocation()
  const isMobileView = useMedia('(max-width: 870px)')

  const [detailsShown, setDetailsShown] = useState(false)

  const isOnStakingPage = pathname === '/staking'
  const tokensSymbols = Object.keys(userTokens)

  const handleChangeWallet = async () => await dispatch(changeWallet())
  const disconnectWallet = async () => await dispatch(disconnect())
  const closeDetailsHandler = () => setDetailsShown(false)
  const mouseOverHanlder = () => setDetailsShown(true)

  // will implemented after Sam's answers about data for this block
  const coinsInfo = {
    MVKExchangeRate: tokensPrices?.mvk ?? 0,
    userMVKBalance: userTokens[MVK_TOKEN_SYMBOL].balance,
    userXTZBalance: userTokens[XTZ_TOKEN_SYMBOL].balance,
    userMVKStaked: userTokens[SMVK_TOKEN_SYMBOL].balance,
    XTZExchnageRate: tokensPrices?.tezos ?? 0,
  }

  if (!accountPkh) return null

  return (
    <WalletDetailsStyled onMouseOver={mouseOverHanlder} onMouseLeave={closeDetailsHandler}>
      <WalletDetailsVisiblePart
        isShown={detailsShown}
        onMouseOver={mouseOverHanlder}
        onMouseLeave={closeDetailsHandler}
      >
        <Icon id="wallet" className="wallet" />
        <TzAddress tzAddress={accountPkh} hasIcon={false} shouldCopy={false} />
        <Icon id="paginationArrowLeft" className="end-icon" />
      </WalletDetailsVisiblePart>

      <WalletDetailsHiddenPart isShown={detailsShown}>
        <div className="top">
          <Icon id="wallet" />
          <TzAddress tzAddress={accountPkh} type={BLUE} />
          <a href={`https://ghost.tzstats.com/${accountPkh}`} target="_blank" rel="noreferrer">
            <Icon id="send" className="icon-send" />
          </a>
        </div>

        <hr />

        <div className="tokens scroll-block">
          <div className="row">
            <div className="icon">
              <Icon id={'mvkTokenGold'} />
            </div>
            <div className="values">
              <CommaNumber
                value={userTokens[MVK_TOKEN_SYMBOL].balance}
                endingText={'MVK'}
                showDecimal
                className="asset-amount"
              />
              <CommaNumber
                value={userTokens[MVK_TOKEN_SYMBOL].balance * tokensPrices[MVK_TOKEN_SYMBOL]}
                endingText={'USD'}
                showDecimal
                className="converted-amount"
              />
            </div>

            <div className="action">
              <Button onClick={() => mountWertWiget('MVK')} kind={BUTTON_SIMPLE} disabled>
                Buy MVK <Icon id="paginationArrowLeft" />
              </Button>
            </div>
          </div>

          <div className="row">
            <div className="icon">
              <Icon id={'mvkTokenSilver'} />
            </div>
            <div className="values">
              <CommaNumber
                value={userTokens[SMVK_TOKEN_SYMBOL].balance}
                endingText={'SMVK'}
                showDecimal
                className="asset-amount"
              />
              <div className="converted-amount">Total staked MVK</div>
            </div>

            <div className="action">
              <Button
                onClick={() => (isOnStakingPage ? setDetailsShown(false) : history.push('/staking'))}
                kind={BUTTON_SIMPLE}
              >
                Stake MVK <Icon id="paginationArrowLeft" />
              </Button>
            </div>
          </div>

          <div className="row">
            <div className="icon">
              <Icon id={'xtzTezos'} />
            </div>
            <div className="values">
              <CommaNumber
                value={userTokens[XTZ_TOKEN_SYMBOL].balance}
                endingText={'XTZ'}
                showDecimal
                className="asset-amount"
              />
              <CommaNumber
                value={userTokens[XTZ_TOKEN_SYMBOL].balance * tokensPrices[XTZ_TOKEN_SYMBOL]}
                endingText={'USD'}
                showDecimal
                className="converted-amount"
              />
            </div>

            <div className="action">
              <Button onClick={() => mountWertWiget('XTZ')} kind={BUTTON_SIMPLE} disabled>
                Buy XTZ <Icon id="paginationArrowLeft" />
              </Button>
            </div>
          </div>

          {tokensSymbols.map((tokenSymbol) => {
            if (
              tokenSymbol === MVK_TOKEN_SYMBOL ||
              tokenSymbol === SMVK_TOKEN_SYMBOL ||
              tokenSymbol === XTZ_TOKEN_SYMBOL
            )
              return null
            const tokenData = userTokens[tokenSymbol]
            const tokenRate = tokensPrices[tokenSymbol]

            return (
              <div className="row">
                <div className="icon">{tokenData.icon ? <Icon id={tokenData.icon} /> : <Icon id={'noImage'} />}</div>
                <div className="values">
                  <CommaNumber
                    value={tokenData.balance}
                    endingText={tokenData.name}
                    showDecimal
                    className="asset-amount"
                  />
                  {tokenRate ? (
                    <CommaNumber
                      value={tokenData.balance * tokenRate}
                      endingText={'USD'}
                      showDecimal
                      className="converted-amount"
                    />
                  ) : null}
                </div>
                {/* <div className="action">
                <Button onClick={disconnectWallet} kind={BUTTON_SIMPLE} disabled>
                  Buy MVK <Icon id="paginationArrowRight" />
                </Button>
              </div> */}
              </div>
            )
          })}
        </div>

        <div className="action-btn-wrapper">
          <Button onClick={handleChangeWallet} form={BUTTON_WIDE} kind={BUTTON_PRIMARY}>
            <Icon id="exchange" /> Change Wallet
          </Button>

          <Button onClick={disconnectWallet} form={BUTTON_WIDE} kind={BUTTON_SECONDARY}>
            <Icon id="exit" /> Sign out
          </Button>
        </div>
      </WalletDetailsHiddenPart>
    </WalletDetailsStyled>
  )
}

/*
OLD MOBILE WALLET STYLING
type ConnectedWalletBlockProps = {
  accountPkh: string
  signOutHandler: () => void
  changeWalletHandler: () => void
  coinsInfo: CoinsInfoType
  isMobile: boolean
  detailsHandlers: {
    buyXTZHandler: () => void
    buyMVKHandler: () => void
    stakeMVKHandler: () => void
  }
  closeMobileMenu: (e: React.MouseEvent<HTMLElement>) => void
}

export const MobileDetailsBlock = ({
  accountPkh,
  coinsInfo,
  signOutHandler,
  changeWalletHandler,
  detailsHandlers,
  handleCloseBtn,
  closeMobileMenu,
}: ConnectedWalletBlockProps & { handleCloseBtn: () => void }) => {
  return (
    <MobileDetailsStyled>
      <div className="close" onClick={handleCloseBtn}>
        <Icon id="close-stroke" />
      </div>
      <div className="top-visible-part ">
        <Icon id="wallet" className="wallet" />
        <var>
          <TzAddress tzAddress={accountPkh} hasIcon={false} shouldCopy={false} />
        </var>
        <Icon id="openLinkRight" className="openLink" />
      </div>

      <div className="details">
        <ConnectedWalletDetailsItem
          buttonText={'Buy MVK'}
          coinAmount={coinsInfo.userMVKBalance}
          coinName={'MVK'}
          buttonHandler={detailsHandlers.buyMVKHandler}
          subtextAmount={coinsInfo.userMVKBalance * coinsInfo.MVKExchangeRate}
        />
        <ConnectedWalletDetailsItem
          buttonText={'Stake MVK'}
          coinAmount={coinsInfo.userMVKStaked}
          coinName={'MVK'}
          buttonHandler={(e: React.MouseEvent<HTMLElement>) => {
            closeMobileMenu(e)
            handleCloseBtn()
            detailsHandlers.stakeMVKHandler()
          }}
          subtextInfo="Total staked MVK"
        />
        <ConnectedWalletDetailsItem
          buttonText={'Buy XTZ'}
          coinAmount={coinsInfo.userXTZBalance}
          coinName={'XTZ'}
          buttonHandler={detailsHandlers.buyXTZHandler}
          subtextAmount={coinsInfo.userXTZBalance * coinsInfo.XTZExchnageRate}
        />

        <div className="buttons-wrapper">
          <SignOutButton onClick={signOutHandler}>Sign out</SignOutButton>
          <Button
            text="Change Wallet"
            onClick={changeWalletHandler}
            kind={ACTION_PRIMARY}
            icon="exchange"
            className="change-wallet"
            strokeWidth={0.3}
          />
        </div>
      </div>
    </MobileDetailsStyled>
  )
}
*/
