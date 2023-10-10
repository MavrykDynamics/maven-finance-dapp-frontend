import { useHistory, useLocation } from 'react-router-dom'
import { useState } from 'react'

import { BUTTON_PRIMARY, BUTTON_SECONDARY, BUTTON_SIMPLE, BUTTON_WIDE } from '../Button/Button.constants'
import { PRIMARY_TZ_ADDRESS_COLOR, SECONDARY_TZ_ADDRESS_COLOR } from '../TzAddress/TzAddress.constants'
import { MVK_TOKEN_SYMBOL, XTZ_TOKEN_SYMBOL, SMVK_TOKEN_ADDRESS, XTZ_TOKEN_ADDRESS } from 'utils/constants'

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
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'

type ConnectWalletProps = {
  mountWertWiget: (commodity: string) => void
}

export const WalletDetails = ({ mountWertWiget }: ConnectWalletProps) => {
  const history = useHistory()

  const { tokensPrices, tokensMetadata } = useTokensContext()
  const { userAddress, userTokensBalances, signOut, changeUser } = useUserContext()
  const {
    contractAddresses: { mvkTokenAddress },
  } = useDappConfigContext()

  const mvkTokenRate = tokensPrices[MVK_TOKEN_SYMBOL]
  const xtzTokenRate = tokensPrices[XTZ_TOKEN_SYMBOL]

  const { pathname } = useLocation()

  const [detailsShown, setDetailsShown] = useState(false)

  const isOnStakingPage = pathname === '/staking'

  const handleStakeBtn = () => {
    if (!isOnStakingPage) history.push('/staking')
    setDetailsShown(false)
  }

  const closeDetailsHandler = () => setDetailsShown(false)
  const mouseOverHanlder = () => setDetailsShown(true)

  if (!userAddress || !userTokensBalances) return null

  const userTokens = Object.keys(userTokensBalances)

  return (
    <WalletDetailsStyled onMouseOver={mouseOverHanlder} onMouseLeave={closeDetailsHandler}>
      <WalletDetailsVisiblePart
        isShown={detailsShown}
        onMouseOver={mouseOverHanlder}
        onMouseLeave={closeDetailsHandler}
      >
        <Icon id="wallet" className="wallet" />
        <TzAddress tzAddress={userAddress} hasIcon={false} shouldCopy={false} type={SECONDARY_TZ_ADDRESS_COLOR} />
        <Icon id="paginationArrowLeft" className="end-icon" />
      </WalletDetailsVisiblePart>

      <WalletDetailsHiddenPart isShown={detailsShown}>
        <div className="top">
          <Icon id="wallet" />
          <TzAddress tzAddress={userAddress} type={PRIMARY_TZ_ADDRESS_COLOR} />
          <a href={`https://ghost.tzstats.com/${userAddress}`} target="_blank" rel="noreferrer">
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
              <div className="row" key={tokenAddress}>
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
          <Button onClick={signOut} form={BUTTON_WIDE} kind={BUTTON_SECONDARY}>
            <Icon id="exit" /> Sign out
          </Button>
          <Button onClick={changeUser} form={BUTTON_WIDE} ignoreLoading kind={BUTTON_PRIMARY}>
            <Icon id="exchange" /> Change Wallet
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
  const history = useHistory()

  const { tokensPrices, tokensMetadata } = useTokensContext()
  const { userAddress, userTokensBalances, signOut, changeUser } = useUserContext()
  const {
    contractAddresses: { mvkTokenAddress },
  } = useDappConfigContext()

  const mvkTokenRate = tokensPrices[MVK_TOKEN_SYMBOL]
  const xtzTokenRate = tokensPrices[XTZ_TOKEN_SYMBOL]

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

  const clickHander = () => setDetailsShown(!detailsShown)

  if (!userAddress || !userTokensBalances) return null

  const userTokens = Object.keys(userTokensBalances)

  return (
    <MobileWalletDetailsStyled>
      <WalletDetailsVisiblePart isShown={detailsShown} onClick={clickHander}>
        <Icon id="wallet" className="wallet" />
        <TzAddress tzAddress={userAddress} hasIcon={false} shouldCopy={false} type={SECONDARY_TZ_ADDRESS_COLOR} />
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
          <TzAddress tzAddress={userAddress} type={PRIMARY_TZ_ADDRESS_COLOR} />
          <a href={`https://ghost.tzstats.com/${userAddress}`} target="_blank" rel="noreferrer">
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
              <div className="row" key={tokenAddress}>
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
          <Button onClick={signOut} form={BUTTON_WIDE} kind={BUTTON_SECONDARY}>
            <Icon id="exit" /> Sign out
          </Button>
          <Button onClick={changeUser} form={BUTTON_WIDE} ignoreLoading kind={BUTTON_PRIMARY}>
            <Icon id="exchange" /> Change Wallet
          </Button>
        </div>
      </MobileWalletDetailsHiddenPart>
    </MobileWalletDetailsStyled>
  )
}
