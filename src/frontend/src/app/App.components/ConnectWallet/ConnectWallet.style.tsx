import styled, { css } from 'styled-components/macro'
import { MavrykTheme } from 'styles/interfaces'

export const ConnectWalletBtnWrap = styled.div`
  min-width: 220px;
`

export const WalletDetailsHiddenPart = styled.div<{ theme: MavrykTheme; isShown: boolean }>`
  width: 375px;

  position: absolute;
  top: 80px;
  right: 15px;

  background: #160e3f;
  border: 1px solid ${({ theme }) => theme.valueColor};

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

  &.visible {
    visibility: visible;
    opacity: 1;
  }

  hr {
    width: 100%;
    height: 1px;
    background: ${({ theme }) => theme.lPurple_dPurple_lPuprple};
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
        fill: ${({ theme }) => theme.textColor};
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
      fill: ${({ theme }) => theme.dataColor};
    }
  }

  .tokens {
    margin: 12px 0 20px 0;
    display: flex;
    flex-direction: column;
    max-height: 180px;
    overflow-y: auto;

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
        svg {
          height: 24px;
          width: 24px;
          fill: ${({ theme }) => theme.textColor};
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
        color: ${({ theme }) => theme.textColor};
      }

      .converted-amount {
        font-weight: 600;
        font-size: 14px;
        line-height: 21px;
        color: ${({ theme }) => theme.dataColor};
      }

      .action {
        margin-left: auto;

        svg {
          width: 7px;
          height: 12px;
          transform: rotate(180deg);
          fill: ${({ theme }) => theme.valueColor};
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
        background: ${({ theme }) => theme.lPurple_dPurple_lPuprple};
      }
    }
  }

  .action-btn-wrapper {
    display: grid;
    justify-content: space-between;
    grid-template-columns: 185px 140px;
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
    color: ${({ theme }) => theme.valueColor};
  }

  .end-icon {
    height: 15px;
    width: 10px;
    margin-left: 3px;
    transform: rotate(-90deg);
    fill: ${({ theme }) => theme.valueColor};

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
    fill: ${({ theme }) => theme.valueColor};
    transition: 0.3s fill;
  }
`

export const WalletDetailsStyled = styled.div`
  height: 100%;
`

export const WertIo = styled.div`
  width: 100%;
  background: #160e3f;
  padding: 30px;
  border-radius: 10px;
  border: 1px solid #86d4c9;
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
