import styled from 'styled-components'
import { MavenTheme } from 'styles/interfaces'

export const LiquidateVaultModalStyled = styled.div<{ theme: MavenTheme }>`
  font-weight: 600;
  font-size: 14px;
  line-height: 21px;

  h1 {
    margin: 0;
  }

  h3,
  h4 {
    font-weight: 600;

    &::after {
      display: none;
    }
  }

  h3 {
    font-size: 22px;
    margin-bottom: 32px;
  }

  h4 {
    font-size: 18px;
  }

  .popup-description {
    margin-bottom: 30px;

    p {
      margin: 0;
      color: ${({ theme }) => theme.mainHeadingText};
    }
  }

  .numberColor,
  .upColor,
  .downColor {
    font-weight: 600;
    font-size: 16px;
    line-height: 22px;

    &.numberColor p {
      color: ${({ theme }) => theme.primaryText};
    }

    &.upColor p {
      color: ${({ theme }) => theme.upColor};
    }

    &.downColor p {
      color: ${({ theme }) => theme.downColor};
    }

    &.converted {
      font-size: 12px;
      line-height: 4px;
      font-weight: 400;
    }
  }

  .stats-row {
    display: grid;
    grid-template-columns: 0.4fr 0.4fr 0.2fr;
    column-gap: 32px;
    margin-top: 10px;
  }

  .cell {
    display: flex;
    flex-direction: column;
    row-gap: 4px;

    p {
      margin: 0;
    }

    .title {
      display: flex;
      align-items: center;
      column-gap: 4px;
      line-height: 100%;
    }
  }

  .input-wrapper {
    margin-top: 20px;

    .input-title {
      margin-top: 10px;
      padding-left: 7px;
    }

    .input-unit {
      min-width: 40px;
      height: 100%;

      display: flex;
      align-items: center;
      justify-content: center;
    }

    .toggle-wrapper {
      margin-top: 6px;
    }
  }

  hr {
    margin: 15px 0 20px 0;

    height: 1px;
    background-color: ${({ theme }) => theme.divider};
    border: none;
  }

  .vault-assets-wrapper {
    display: flex;
    flex-direction: column;

    row-gap: 10px;
    margin-top: 32px;

    .token-info {
      display: flex;
      column-gap: 8px;
      align-items: center;

      .img-wrapper {
        width: 25px;
        height: 24px;

        img {
          object-fit: cover;
        }
      }
    }
  }

  .liquidation-btn-wrapper {
    max-width: 250px;

    margin-top: 24px;
    margin-inline: auto;

    button {
      width: 100%;
    }
  }
`
