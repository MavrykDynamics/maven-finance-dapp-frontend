import styled from "styled-components";
import { MavrykTheme } from "styles/interfaces";

export const LiquidateVaultModalStyled = styled.div<{ showAsPercentage: boolean; theme: MavrykTheme }>`
  font-weight: 600;
  font-size: 14px;
  line-height: 21px;

  & > h1 {
    margin: 0;
  }

  & > h2 {
    margin: 30px 0 10px 0;

    font-weight: 600;
    font-size: 18px;
    line-height: 27px;

    &::after {
      content: '';
      height: 0;
    }
  }

  .without-underscore {
    margin-bottom: 20px;

    &::after {
      content: '';
      height: 0;
    }
  }

  & > p {
    margin: 0;
    margin-bottom: 30px;
  }

  div[class="g-centering-group"] > button {
    margin-top: 40px;
    width: 250px;
  }

  hr {
    margin: 25px 0 30px 0;

    height: 1px;
    background-color: ${({ theme }) => theme.cardBorderColor};
    border: none;
  }

  table {
    width: 100%;
    border-collapse: collapse;

    font-weight: 600;
    font-size: 16px;
    line-height: 22px;

    th {
      width: 33%;
      text-align: start;

      &:last-of-type {
        text-align: end;
      }
    }

    tbody {
      tr {
        border-bottom: 1px solid ${({ theme }) => theme.dataColor};
        text-transform: capitalize;

        &:last-of-type {
          border-bottom: none;
        }

        td {
          color: ${({ theme }) => theme.dataColor};

          p {
            margin: 0;
          }

          &:last-of-type {
            text-align: end;
          }
        }
      }
    }

    .grid-group {
      display: grid;
      grid-template-columns: 40px auto;
      column-gap: 8px;
    }
  }

  .flex-group {
    display: flex;
    justify-content: space-between;

    p {
      margin: 0;
    }
  }

  .grid-group {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    column-gap: 15px;
    row-gap: 20px;

    p {
      margin: 0;
    }
  }

  .v-centering-group {
    display: flex;
    align-items: center;
  }

  .g-centering-group {
    display: flex;
    justify-content: center;
  }

  .toggle {
    span {
      color: ${({ theme }) => theme.valueColor};
    }

    ${({ showAsPercentage, theme }) => showAsPercentage
      ? `.sufix {
          color: ${theme.headerColor};
        }`
      : `.prefix {
          color: ${theme.headerColor};
        }`}
  }

  .info-icon {
    margin-left: 4px;
    width: 12px;
    height: 12px;
    fill: ${({ theme }) => theme.textColor};
  }

  .numberColor,
  .upColor,
  .downColor {
    font-weight: 600;
    font-size: 16px;
    line-height: 22px;
  }

  .numberColor {
    color: ${({ theme }) => theme.dataColor};
  }

  .upColor {
    color: ${({ theme }) => theme.newUpColor}
  }

  .downColor {
    color: ${({ theme }) => theme.downColor}
  }

  .input {
    margin: 3px 0;
    height: 56px;

    input {
      padding-top: 3px;
    }
  }

  .input-title {
    margin-top: 20px;
    padding-left: 7px;
  }

  .close-modal {
    position: absolute;
    top: 15px;
    right: 15px;
    cursor: pointer;
    transition: opacity 0.3s;

    &:after,
    &:before {
      content: '';
      height: 30px;
      width: 30px;
      border-top: 3px solid ${({ theme }) => theme.valueColor};
      position: absolute;
      top: 10px;
      right: -12px;
      transform: rotate(-45deg);
    }

    &:before {
      right: 9px;
      transform: rotate(45deg);
    }

    &:hover {
      opacity: 0.7;
    }
  }
`
