import styled from 'styled-components'
import { MavenTheme } from 'styles/interfaces'

export const LiquidateVaultModalStyled = styled.div<{ theme: MavenTheme }>`
  font-weight: 600;
  font-size: 14px;
  line-height: 21px;

  h3,
  h4 {
    font-weight: 600;

    &::after {
      display: none;
    }
  }

  h3 {
    font-size: 22px;
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
  }

  .cell {
    display: flex;
    flex-direction: column;

    row-gap: 6px;

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

  .stats-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
  }

  .stats-wrapper {
    display: flex;
    flex-direction: column;
    row-gap: 20px;

    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;

      column-gap: 15px;
      row-gap: 20px;
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
    margin-top: 30px;

    .table-amount-group {
      display: grid;
      grid-template-columns: 60px auto;
      column-gap: 8px;
    }
  }

  .liquidation-btn-wrapper {
    max-width: 250px;

    margin-top: 40px;
    margin-inline: auto;
  }
`
