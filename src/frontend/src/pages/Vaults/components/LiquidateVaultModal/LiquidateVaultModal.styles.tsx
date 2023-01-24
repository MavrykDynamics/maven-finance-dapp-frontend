import styled from "styled-components";
import { MavrykTheme } from "styles/interfaces";

export const LiquidateVaultModalStyled = styled.div<{ theme: MavrykTheme }>`
  & > h1 {
    margin: 0;
  }

  & > p {
    margin: 0;
    margin-bottom: 30px;
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