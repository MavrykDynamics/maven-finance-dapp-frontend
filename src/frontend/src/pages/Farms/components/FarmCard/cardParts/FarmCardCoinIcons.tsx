import styled, { css } from 'styled-components'
import classNames from 'classnames'

// view
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'

// hooks
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'

// types
import { FarmsTokenMetadataType } from 'providers/TokensProvider/tokens.provider.types'
import { MavrykTheme } from 'styles/interfaces'

// utils
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'

export const FARM_CARD_COINS_LARGE = 'FARM_CARD_COINS_LARGE'
export const FARM_CARD_COINS_MEDUIM = 'FARM_CARD_COINS_MEDUIM'
export const FARM_CARD_COINS_SMALL = 'FARM_CARD_COINS_SMALL'

const COIN_IMAGES_SIZES = css`
  .primary-icon {
    align-self: flex-end;
    z-index: 1;

    bottom: 0;
    right: 0;
  }

  .secondary-icon {
    align-self: flex-end;

    left: 0;
    top: 0;
  }

  &.${FARM_CARD_COINS_LARGE} {
    height: 55px;
    width: 69px;

    .primary-icon {
      height: 43px;
      width: 43px;
    }

    .secondary-icon {
      height: 30px;
      width: 30px;
    }

    &.mFarm {
      height: 55px;
      width: 55px;
    }
  }

  &.${FARM_CARD_COINS_MEDUIM} {
    height: 48px;
    width: 60px;

    .primary-icon {
      height: 37px;
      width: 37px;
    }

    .secondary-icon {
      height: 27px;
      width: 27px;
    }

    &.mFarm {
      height: 48px;
      width: 48px;
    }
  }

  &.${FARM_CARD_COINS_SMALL} {
    height: 27px;
    width: 31px;

    .primary-icon {
      height: 18px;
      width: 18px;
    }

    .secondary-icon {
      height: 14px;
      width: 14px;
    }

    &.mFarm {
      height: 27px;
      width: 27px;
    }
  }
`

const FarmCardCoinIconsStyled = styled.figure<{ theme: MavrykTheme }>`
  align-items: center;
  position: relative;
  margin: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: fill;
  }

  > div,
  svg {
    align-items: center;
    justify-content: center;
    position: absolute;
    fill: ${({ theme }) => theme.textColor};
  }

  &.mFarm {
    > div {
      width: 100%;
      height: 100%;
    }
  }

  ${COIN_IMAGES_SIZES}
`

type FarmCardCoinsSize = typeof FARM_CARD_COINS_LARGE | typeof FARM_CARD_COINS_MEDUIM | typeof FARM_CARD_COINS_SMALL

type CoinIconsPropsType = {
  farmToken: FarmsTokenMetadataType
  isMFarm: boolean
  size: FarmCardCoinsSize
}

export const FarmCardCoinIcons = ({ isMFarm, farmToken, size }: CoinIconsPropsType) => {
  const { tokensMetadata } = useTokensContext()

  if (isMFarm) {
    return (
      <FarmCardCoinIconsStyled className={classNames('mFarm', size)}>
        <ImageWithPlug imageLink={farmToken.icon} plugSrc={'/images/coin-gold.svg'} alt={farmToken.symbol + ' icon'} />
      </FarmCardCoinIconsStyled>
    )
  }

  const token0Metadata = getTokenDataByAddress({ tokenAddress: farmToken.farmLpData.token0?.address, tokensMetadata })
  const token0Icon = token0Metadata?.icon ?? farmToken.farmLpData.token0?.icon ?? token0Metadata?.icon
  // const token0Icon = null

  const token1Metadata = getTokenDataByAddress({ tokenAddress: farmToken.farmLpData.token1?.address, tokensMetadata })
  const token1Icon = token1Metadata?.icon ?? farmToken.farmLpData.token1?.icon ?? token1Metadata?.icon
  // const token1Icon = null

  return (
    <FarmCardCoinIconsStyled className={classNames(size)}>
      <ImageWithPlug
        imageLink={token0Icon}
        plugSrc={'/images/coin-gold.svg'}
        alt={`${farmToken.farmLpData.token0?.symbol ?? 'gold'} - logo`}
        className={'primary-icon'}
      />

      <ImageWithPlug
        imageLink={token1Icon}
        plugSrc={'/images/coin-silver.svg'}
        alt={`${farmToken.farmLpData.token1?.symbol ?? 'silver'} - logo`}
        className={'secondary-icon'}
      />
    </FarmCardCoinIconsStyled>
  )
}
