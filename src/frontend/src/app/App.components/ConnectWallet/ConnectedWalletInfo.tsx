import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useLocation } from 'react-router-dom'
import { useState } from 'react'

import { State } from '../../../reducers'
import { BUTTON_PRIMARY, BUTTON_SECONDARY, BUTTON_SIMPLE, BUTTON_WIDE } from '../Button/Button.constants'
import { PRIMARY_TZ_ADDRESS_COLOR } from '../TzAddress/TzAddress.constants'
import { MVK_TOKEN_SYMBOL, XTZ_TOKEN_SYMBOL, SMVK_TOKEN_SYMBOL } from 'utils/constants'
import { changeWallet, disconnect } from './ConnectWallet.actions'

import Icon from '../Icon/Icon.view'
import { TzAddress } from '../TzAddress/TzAddress.view'
import Button from '../Button/NewButton'
import { CommaNumber } from '../CommaNumber/CommaNumber.controller'
import {
  MobileWalletDetailsHiddenPart,
  MobileWalletDetailsStyled,
  WalletDetailsHiddenPart,
  WalletDetailsStyled,
  WalletDetailsVisiblePart,
} from './ConnectWallet.style'

type ConnectWalletProps = {
  mountWertWiget: (commodity: string) => void
}

export const WalletDetails = ({ mountWertWiget }: ConnectWalletProps) => {
  const dispatch = useDispatch()
  const history = useHistory()
  const {
    accountPkh,
    user: { userTokens },
  } = useSelector((state: State) => state.wallet)
  const { tokensPrices } = useSelector((state: State) => state.tokens)

  const { pathname } = useLocation()

  const [detailsShown, setDetailsShown] = useState(false)

  const isOnStakingPage = pathname === '/staking'

  const handleStakeBtn = () => {
    if (!isOnStakingPage) history.push('/staking')
    setDetailsShown(false)
  }

  const handleChangeWallet = async () => await dispatch(changeWallet())
  const disconnectWallet = async () => await dispatch(disconnect())
  const closeDetailsHandler = () => setDetailsShown(false)
  const mouseOverHanlder = () => setDetailsShown(true)

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
          <TzAddress tzAddress={accountPkh} type={PRIMARY_TZ_ADDRESS_COLOR} />
          <a href={`https://ghost.tzstats.com/${accountPkh}`} target="_blank" rel="noreferrer">
            <Icon id="send" />
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
              <Button onClick={handleStakeBtn} kind={BUTTON_SIMPLE}>
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

          {/* TODO: uncomment when tokens metadata & other stuff can be stored in 1 place */}
          {/* {tokensSymbols.map((tokenSymbol) => {
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
                <div className="action">
                <Button onClick={disconnectWallet} kind={BUTTON_SIMPLE} disabled>
                  Buy MVK <Icon id="paginationArrowRight" />
                </Button>
              </div> 
              </div>
            )
          })} */}
        </div>

        <div className="action-btn-wrapper">
          <Button onClick={handleChangeWallet} form={BUTTON_WIDE} ignoreLoading kind={BUTTON_PRIMARY}>
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

type MobileConnectWalletProps = ConnectWalletProps & {
  closeMobileMenu: () => void
}

export const MobileWalletDetails = ({ closeMobileMenu, mountWertWiget }: MobileConnectWalletProps) => {
  const dispatch = useDispatch()
  const history = useHistory()
  const {
    accountPkh,
    user: { userTokens },
  } = useSelector((state: State) => state.wallet)
  const { tokensPrices } = useSelector((state: State) => state.tokens)

  const { pathname } = useLocation()

  const [detailsShown, setDetailsShown] = useState(false)

  const isOnStakingPage = pathname === '/staking'

  const handleStakeBtn = () => {
    if (!isOnStakingPage) {
      history.push('/staking')
    }

    setDetailsShown(false)
    closeMobileMenu()
  }

  const handleChangeWallet = async () => await dispatch(changeWallet())
  const disconnectWallet = async () => await dispatch(disconnect())
  const clickHander = () => setDetailsShown(!detailsShown)

  if (!accountPkh) return null

  return (
    <MobileWalletDetailsStyled>
      <WalletDetailsVisiblePart isShown={detailsShown} onClick={clickHander}>
        <Icon id="wallet" className="wallet" />
        <TzAddress tzAddress={accountPkh} hasIcon={false} shouldCopy={false} />
        <Icon id="paginationArrowLeft" className="end-icon" />
      </WalletDetailsVisiblePart>

      <MobileWalletDetailsHiddenPart isShown={detailsShown}>
        {detailsShown ? (
          <div className="close-details-btn">
            <Button kind={BUTTON_SIMPLE} onClick={() => setDetailsShown(false)}>
              <Icon id="close-stroke" />
            </Button>{' '}
          </div>
        ) : null}

        <div className="top">
          <Icon id="wallet" />
          <TzAddress tzAddress={accountPkh} type={PRIMARY_TZ_ADDRESS_COLOR} />
          <a href={`https://ghost.tzstats.com/${accountPkh}`} target="_blank" rel="noreferrer">
            <Icon id="send" />
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
              <Button onClick={handleStakeBtn} kind={BUTTON_SIMPLE}>
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

          {/* TODO: uncomment when tokens metadata & other stuff can be stored in 1 place */}
          {/* {tokensSymbols.map((tokenSymbol) => {
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
                <div className="action">
                <Button onClick={disconnectWallet} kind={BUTTON_SIMPLE} disabled>
                  Buy MVK <Icon id="paginationArrowRight" />
                </Button>
              </div> 
              </div>
            )
          })} */}
        </div>

        <div className="action-btn-wrapper">
          <Button onClick={handleChangeWallet} form={BUTTON_WIDE} ignoreLoading kind={BUTTON_PRIMARY}>
            <Icon id="exchange" /> Change Wallet
          </Button>

          <Button onClick={disconnectWallet} form={BUTTON_WIDE} kind={BUTTON_SECONDARY}>
            <Icon id="exit" /> Sign out
          </Button>
        </div>
      </MobileWalletDetailsHiddenPart>
    </MobileWalletDetailsStyled>
  )
}
