import styled from "styled-components";
import { MavrykTheme } from "styles/interfaces";

export const LiquidateVaultModalStyled = styled.div<{ theme: MavrykTheme }>`
  font-weight: 600;
  font-size: 14px;
  line-height: 21px;

  & > h1 {
    margin: 0;
  }

  & > p {
    margin: 0;
    margin-bottom: 30px;
  }

  hr {
    margin: 25px 0 30px 0;

    height: 1px;
    background-color: ${({ theme }) => theme.cardBorderColor};
    border: none;
  }

  .flex-group {
    display: flex;
    justify-content: space-between;

    p {
      margin: 0;
    }
  }

  .centering-group {
    display: flex;
    align-items: center;
  }

  .group-with-toggle {
    span {
      color: ${({ theme }) => theme.headerColor};
    }

    .active {
      color: ${({ theme }) => theme.valueColor};
    }
  }

  .info-icon {
    margin-left: 4px;
    width: 12px;
    height: 12px;
    fill: ${({ theme }) => theme.textColor};
  }

  .numberColor {
    color: ${({ theme }) => theme.dataColor}
  }

  .input {
    margin: 3px 0;
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
