import styled, { css } from 'styled-components/macro'
import { MavrykTheme } from 'styles/interfaces'

export const ConnectWalletBtnWrap = styled.div`
  min-width: 220px;

  &.isWide {
    width: 100%;
  }
`

// WALLET INFO STYLING
export const WalletDetailsStyled = styled.div`
  height: 100%;
`

export const WalletDetailsHiddenPart = styled.div<{ theme: MavrykTheme; isShown: boolean }>`
  width: 375px;

  position: absolute;
  top: 80px;
  right: 15px;

  background: ${({ theme }) => theme.cards};
  border: 1px solid ${({ theme }) => theme.linksAndButtons};

  border-radius: 10px;
  padding: 33px 0 33px 0;

  visibility: hidden;
  opacity: 0;
  transition: 500ms opacity, 500ms visibility;

  ${({ isShown }) =>
    css`
      visibility: ${isShown ? 'visible' : 'hidden'};
      opacity: ${isShown ? 1 : 0};
      pointer-events: ${isShown ? 'initial' : 'none'};
    `}

  hr {
    width: 100%;
    height: 1px;
    background: ${({ theme }) => theme.divider};
    border: none;
  }

  > div {
    padding: 0 20px;
  }

  .top {
    display: flex;
    align-items: center;
    column-gap: 10px;
    margin-bottom: 30px;

    a {
      display: block;
      margin-left: auto;
      width: 16px;
      height: 16px;

      svg {
        width: 16px;
        height: 16px;
        fill: ${({ theme }) => theme.regularText};
      }
    }

    .tzAddressToClick {
      font-size: 22px;
      font-weight: 600;

      svg {
        width: 20px;
        height: 20px;
      }
    }

    > svg {
      width: 20px;
      height: 24px;
      fill: ${({ theme }) => theme.primaryText};
    }
  }

  .tokens {
    margin: 12px 0 20px 0;
    display: flex;
    flex-direction: column;
    max-height: 180px;
    overflow-y: auto;
    overscroll-behavior: contain;

    .row {
      height: 60px;
      padding: 8px 0;
      display: flex;
      align-items: center;
      position: relative;

      p {
        margin: 0;
      }

      .icon {
        margin-right: 13px;
        svg,
        .img-wrapper {
          height: 24px;
          width: 24px;
          fill: ${({ theme }) => theme.regularText};

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
      }

      .values {
        display: flex;
        flex-direction: column;
        height: fit-content;
      }

      .asset-amount {
        font-weight: 600;
        font-size: 18px;
        line-height: 27px;
        color: ${({ theme }) => theme.primaryText};
      }

      .converted-amount {
        font-weight: 600;
        font-size: 14px;
        line-height: 21px;
        color: ${({ theme }) => theme.regularText};
      }

      .action {
        margin-left: auto;

        svg {
          width: 7px;
          height: 12px;
          transform: rotate(180deg);
          fill: ${({ theme }) => theme.linksAndButtons};
        }
      }

      &:not(:last-child)::before {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 100%;
        height: 1px;
        background: ${({ theme }) => theme.divider};
      }
    }
  }

  .action-btn-wrapper {
    display: grid;
    justify-content: space-between;
    grid-template-columns: 140px 185px;
  }
`

export const WalletDetailsVisiblePart = styled.div<{ theme: MavrykTheme; isShown: boolean }>`
  width: fit-content;
  height: 100%;
  cursor: pointer;

  * {
    cursor: pointer;
  }

  margin-left: auto;
  column-gap: 10px;

  display: flex;
  align-items: center;

  > div {
    font-weight: 600;
    font-size: 16px;
    color: ${({ theme }) => theme.linksAndButtons};
  }

  .end-icon {
    height: 15px;
    width: 10px;
    margin-left: 3px;
    transform: rotate(-90deg);
    fill: ${({ theme }) => theme.linksAndButtons};

    ${({ isShown }) =>
      isShown
        ? css`
            transform: rotate(-270deg);
          `
        : ''}
  }

  .wallet {
    width: 22px;
    height: 17px;
    stroke: none;
    fill: ${({ theme }) => theme.linksAndButtons};
    transition: 0.3s fill;
  }
`

export const WertIo = styled.div`
  width: 100%;
  background: ${({ theme }) => theme.cards};
  padding: 30px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.linksAndButtons};
  height: 100%;
  display: flex;
  justify-content: center;

  @media (max-width: 550px) {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 30px 0px;
    border-radius: 0;
    border: none;
  }
`

// MOBILE WALLET STYLING
export const MobileWalletDetailsStyled = styled.div`
  height: fit-content;
  margin: 0 0 30px 0;
`

export const MobileWalletDetailsHiddenPart = styled(WalletDetailsHiddenPart)<{ theme: MavrykTheme; isShown: boolean }>`
  width: 100vw;
  max-height: 90vh;

  position: fixed;
  top: -90vh;
  right: 0;
  z-index: 100;

  padding: 0 0 33px 0;
  border-radius: 0;
  border: unset;

  opacity: 1;
  visibility: visible;
  transition: 1000ms transform;

  ${({ isShown }) =>
    css`
      ${isShown ? 'transform: translateY(90vh);' : ''};
      pointer-events: ${isShown ? 'initial' : 'none'};
    `};

  .close-details-btn {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    height: 77px;
    cursor: pointer;
    width: fit-content;
    margin-left: auto;
    padding-right: 23px;

    svg {
      max-width: 26px;
      height: 21px;
      stroke: ${({ theme }) => theme.linksAndButtons};
      transition: 0.6s all;
    }

    &:hover {
      svg {
        opacity: 0.8;
      }
    }
  }

  .action-btn-wrapper {
    display: grid;
    max-width: 400px;
    margin: 0 auto;
    justify-content: space-between;
    grid-template-columns: minmax(90px, 140px) minmax(120px, 185px);

    @media (max-width: 375px) {
      padding: 0 10px;
    }
  }
`

export const ConnectWalletBannerText = styled.div`
  display: inline;
  font-weight: 500;
`
