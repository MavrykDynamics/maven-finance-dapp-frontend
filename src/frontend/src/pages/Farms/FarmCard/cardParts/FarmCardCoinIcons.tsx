import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { FarmsTokenMetadataType } from 'providers/TokensProvider/tokens.provider.types'
import styled from 'styled-components'
import { MavrykTheme } from 'styles/interfaces'

type CoinIconsPropsType = {
  farmToken: FarmsTokenMetadataType
  isMFarm: boolean
}

export const FarmCardCoinIconsStyled = styled.figure<{ theme: MavrykTheme }>`
  height: 50px;
  align-items: center;
  position: relative;
  margin: 0;
  width: 55px;

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

  .left-top-icon {
    height: 43px;
    width: 43px;
    bottom: 0px;
    right: -5px;
    align-self: flex-end;
    z-index: 1;
  }

  .right-bottom-icon {
    height: 30px;
    width: 30px;
    top: 0px;
    left: 0;
    align-self: flex-end;
  }
`

export const FarmCardCoinIcons = ({ isMFarm, farmToken }: CoinIconsPropsType) => {
  const { tokensMetadata } = useTokensContext()

  if (isMFarm) {
    return (
      <FarmCardCoinIconsStyled className="mFarm">
        <ImageWithPlug imageLink={farmToken.icon} plugSrc={'/images/coin-gold.svg'} alt={farmToken.symbol + ' icon'} />
      </FarmCardCoinIconsStyled>
    )
  }

  const token0Metadata = getTokenDataByAddress({ tokenAddress: farmToken.farmLpData.token0?.address, tokensMetadata })
  const token0Icon = token0Metadata?.icon ?? farmToken.farmLpData.token0?.icon ?? token0Metadata?.icon

  const token1Metadata = getTokenDataByAddress({ tokenAddress: farmToken.farmLpData.token1?.address, tokensMetadata })
  const token1Icon = token1Metadata?.icon ?? farmToken.farmLpData.token1?.icon ?? token1Metadata?.icon

  return (
    <FarmCardCoinIconsStyled>
      <ImageWithPlug
        imageLink={token0Icon}
        plugSrc={'/images/coin-gold.svg'}
        alt={`${farmToken.farmLpData.token0?.symbol ?? 'gold'} - logo`}
        className={'left-top-icon'}
      />

      <ImageWithPlug
        imageLink={token1Icon}
        plugSrc={'/images/coin-silver.svg'}
        alt={`${farmToken.farmLpData.token1?.symbol ?? 'silver'} - logo`}
        className={'right-bottom-icon'}
      />
    </FarmCardCoinIconsStyled>
  )
}
