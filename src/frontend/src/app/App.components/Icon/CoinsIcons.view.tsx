import styled from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'
import { ImageWithPlug } from './ImageWithPlug'

export const FarmCardTokenLogoContainer = styled.figure<{ theme: MavrykTheme }>`
  height: 50px;
  align-items: center;
  position: relative;
  margin: 0;
  width: 55px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  > div {
    align-items: center;
    justify-content: center;
    position: absolute;
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

export default function CoinsIcons({
  firstAssetLogoSrc,
  secondAssetLogoSrc,
  className,
}: {
  firstAssetLogoSrc?: string
  secondAssetLogoSrc?: string
  className?: string
}) {
  return (
    <FarmCardTokenLogoContainer className={className}>
      <ImageWithPlug
        imageLink={firstAssetLogoSrc ? `https://services.tzkt.io/v1/avatars/${firstAssetLogoSrc}` : null}
        plugSrc={'/images/coin-gold.svg'}
        alt={`${firstAssetLogoSrc ?? 'gold'} - logo`}
        className={'left-top-icon'}
      />

      <ImageWithPlug
        imageLink={secondAssetLogoSrc ? `https://services.tzkt.io/v1/avatars/${secondAssetLogoSrc}` : null}
        plugSrc={'/images/coin-silver.svg'}
        alt={`${secondAssetLogoSrc ?? 'silver'} - logo`}
        className={'right-bottom-icon'}
      />
    </FarmCardTokenLogoContainer>
  )
}
