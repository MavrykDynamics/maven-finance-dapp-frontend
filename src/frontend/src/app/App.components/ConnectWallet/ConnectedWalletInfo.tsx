import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useLocation } from 'react-router-dom'
import { useState } from 'react'

import { State } from '../../../reducers'
import { BUTTON_PRIMARY, BUTTON_SECONDARY, BUTTON_SIMPLE, BUTTON_WIDE } from '../Button/Button.constants'
import { BLUE } from '../TzAddress/TzAddress.constants'
import { MVK_TOKEN_SYMBOL, XTZ_TOKEN_SYMBOL, SMVK_TOKEN_ADDRESS, XTZ_TOKEN_ADDRESS } from 'utils/constants'
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
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { getUserTokenBalanceByAddress } from 'providers/UserProvider/helpers/userBalances.helpers'
import { getTokenDataByAddress, isTezosAsset } from 'providers/TokensProvider/helpers/tokens.utils'
import { ImageWithPlug } from '../Icon/ImageWithPlug'

type ConnectWalletProps = {
  mountWertWiget: (commodity: string) => void
}

export const WalletDetails = ({ mountWertWiget }: ConnectWalletProps) => {
  const dispatch = useDispatch()
  const history = useHistory()

  const { tokensPrices, tokensMetadata } = useTokensContext()
  const { userTokensBalances } = useUserContext()

  const mvkTokenRate = tokensPrices[MVK_TOKEN_SYMBOL]
  const xtzTokenRate = tokensPrices[XTZ_TOKEN_SYMBOL]

  const { accountPkh } = useSelector((state: State) => state.wallet)
  const {
    mvkTokenAddress: { address: mvkTokenAddress },
  } = useSelector((state: State) => state.contractAddresses)

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

  if (!accountPkh || !userTokensBalances) return null

  const userTokens = Object.keys(userTokensBalances)

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
                value={getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: mvkTokenAddress })}
                endingText={'MVK'}
                showDecimal
                className="asset-amount"
              />
              <CommaNumber
                value={
                  getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: mvkTokenAddress }) * mvkTokenRate
                }
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
                value={getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: SMVK_TOKEN_ADDRESS })}
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
                value={getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: XTZ_TOKEN_ADDRESS })}
                endingText={'XTZ'}
                showDecimal
                className="asset-amount"
              />
              <CommaNumber
                value={
                  getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: XTZ_TOKEN_ADDRESS }) * xtzTokenRate
                }
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

          {userTokens.map((tokenAddress) => {
            if (tokenAddress === mvkTokenAddress || tokenAddress === SMVK_TOKEN_ADDRESS || isTezosAsset(tokenAddress))
              return null

            const tokenBalance = userTokensBalances[tokenAddress]
            const tokenMetadata = getTokenDataByAddress({ tokenAddress, tokensPrices, tokensMetadata })

            if (!tokenMetadata) return null

            const { symbol, rate, icon } = tokenMetadata

            return (
              <div className="row">
                <div className="icon">
                  {icon ? <ImageWithPlug imageLink={icon} alt={`${symbol} icon`} /> : <Icon id={'noImage'} />}
                </div>
                <div className="values">
                  <CommaNumber value={tokenBalance} endingText={symbol} showDecimal className="asset-amount" />
                  {rate ? (
                    <CommaNumber
                      value={tokenBalance * rate}
                      endingText={'USD'}
                      showDecimal
                      className="converted-amount"
                    />
                  ) : null}
                </div>
              </div>
            )
          })}
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

  const { tokensPrices, tokensMetadata } = useTokensContext()
  const { userTokensBalances } = useUserContext()

  const mvkTokenRate = tokensPrices[MVK_TOKEN_SYMBOL]
  const xtzTokenRate = tokensPrices[XTZ_TOKEN_SYMBOL]

  const { accountPkh } = useSelector((state: State) => state.wallet)
  const {
    mvkTokenAddress: { address: mvkTokenAddress },
  } = useSelector((state: State) => state.contractAddresses)

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

  if (!accountPkh || !userTokensBalances) return null

  const userTokens = Object.keys(userTokensBalances)

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
                value={getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: mvkTokenAddress })}
                endingText={'MVK'}
                showDecimal
                className="asset-amount"
              />
              <CommaNumber
                value={
                  getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: mvkTokenAddress }) * mvkTokenRate
                }
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
                value={getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: SMVK_TOKEN_ADDRESS })}
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
                value={getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: XTZ_TOKEN_ADDRESS })}
                endingText={'XTZ'}
                showDecimal
                className="asset-amount"
              />
              <CommaNumber
                value={
                  getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: XTZ_TOKEN_ADDRESS }) * xtzTokenRate
                }
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

          {userTokens.map((tokenAddress) => {
            if (tokenAddress === mvkTokenAddress || tokenAddress === SMVK_TOKEN_ADDRESS || isTezosAsset(tokenAddress))
              return null

            const tokenBalance = userTokensBalances[tokenAddress]
            const tokenMetadata = getTokenDataByAddress({ tokenAddress, tokensPrices, tokensMetadata })

            if (!tokenMetadata) return null

            const { symbol, rate, icon } = tokenMetadata

            return (
              <div className="row">
                <div className="icon">
                  {icon ? <ImageWithPlug imageLink={icon} alt={`${symbol} icon`} /> : <Icon id={'noImage'} />}
                </div>
                <div className="values">
                  <CommaNumber value={tokenBalance} endingText={symbol} showDecimal className="asset-amount" />
                  {rate ? (
                    <CommaNumber
                      value={tokenBalance * rate}
                      endingText={'USD'}
                      showDecimal
                      className="converted-amount"
                    />
                  ) : null}
                </div>
              </div>
            )
          })}
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
