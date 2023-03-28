import styled from 'styled-components'
import { MavrykTheme } from 'styles/interfaces'

export const LiquidateVaultModalStyled = styled.div<{ showAsPercentage: boolean; theme: MavrykTheme }>`
  font-weight: 600;
  font-size: 14px;
  line-height: 21px;

  & > h1 {
    margin: 0;
  }

  & > h2 {
    margin-top: 10px;

    font-weight: 600;
    font-size: 18px;
    line-height: 27px;

    &::after {
      content: '';
      height: 0;
    }
  }

  .without-underscore {
    margin-bottom: 0;

    &::after {
      content: '';
      height: 0;
    }
  }

  & > p {
    margin: 0;
    margin-bottom: 10px;
  }

  div[class='g-centering-group'] > button {
    margin-top: 10px;
    width: 250px;
  }

  hr {
    margin: 15px 0 20px 0;

    height: 1px;
    background-color: ${({ theme }) => theme.cardBorderColor};
    border: none;
  }

  button:disabled {
    &:hover {
      border: none;
      color: ${({ theme }) => theme.containerColor};
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
    row-gap: 10px;

    p {
      margin: 0;
    }
  }

  .table-amount-group {
    display: grid;
    grid-template-columns: 60px auto;
    column-gap: 8px;
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

    ${({ showAsPercentage, theme }) =>
      showAsPercentage
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
    color: ${({ theme }) => theme.newUpColor};
  }

  .downColor {
    color: ${({ theme }) => theme.downColor};
  }

  .input {
    margin: 3px 0;
    height: 56px;

    input {
      padding-top: 3px;
    }
  }

  .input-title {
    margin-top: 10px;
    padding-left: 7px;
  }

  .img-wrapper,
  .no-icon {
    width: 24px;
    height: 24px;
    margin-right: 5px;

    img,
    svg {
      fill: ${({ theme }) => theme.dataColor};
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
`
