import styled from 'styled-components/macro'
import { MavrykTheme } from 'styles/interfaces'

export const MoveNextRoundModalStyled = styled.div<{ theme: MavrykTheme }>`
  h1 {
    margin: 0 0 20px 0;
  }

  p {
    font-weight: 600;
    font-size: 18px;
    line-height: 27px;
    color: ${({ theme }) => theme.textColor};
    text-align: center;
    margin-top: 0;
    margin-bottom: 20px;
  }

  .step-info {
    margin: 10px auto;
    width: 320px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    p {
      margin: 0;
    }

    .name {
      font-weight: 500;
      font-size: 14px;
      color: ${({ theme }) => theme.textColor};
    }

    .value {
      font-weight: 600;
      font-size: 16px;

      p {
        color: ${({ theme }) => theme.dataColor};
      }
    }
  }

  .btn-group {
    display: flex;
    margin-bottom: 10px;
    margin-top: 20px;
    column-gap: 10px;
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
