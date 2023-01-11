import styled from 'styled-components'
import { MavrykTheme } from 'styles/interfaces'

export const LoansModalBase = styled.div<{ theme: MavrykTheme }>`
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

  .modalDescr {
    margin-top: 7px;
    font-weight: 600;
    font-size: 14px;
    line-height: 21px;
    color: ${({ theme }) => theme.textColor};
    margin-bottom: 25px;
  }

  .block-name {
    font-weight: 600;
    font-size: 14px;
    line-height: 21px;
    color: ${({ theme }) => theme.textColor};
    padding-left: 7px;
    padding-bottom: 3px;
  }

  .modal-manage-btn {
    margin: 60px auto 0 auto;
    width: 250px;
  }

  .buttons-wrapper {
    display: flex;
    justify-content: center;
    column-gap: 10px;
    margin-top: 60px;

    button {
      margin-top: 0;
      width: calc(50% - 5px);
    }
  }

  hr {
    background: ${({ theme }) => theme.cardBorderColor};
    margin: 40px 0;
    height: 0.5px;
    border: none;
  }

  .loans-confirmation-info {
    display: flex;
    flex-direction: column;
    row-gap: 15px;
    padding: 0 20px;

    > div {
      margin: 0;
    }

    hr {
      margin: 0;
    }
  }

  .lending-stats {
    display: flex;
    justify-content: space-between;

    .left-divider {
      position: relative;
      &::before {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        left: -25px;
        content: '';
        height: 100%;
        width: 1px;
        background: ${({ theme }) => theme.cardBorderColor};
      }
    }

    .name {
      .tooltip {
        svg {
          height: 14px;
          width: 14px;
        }
      }
    }
  }
`

export const VaultModalOverview = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  justify-content: space-between;
  border: 1px solid ${({ theme }) => theme.cardBorderColor};
  padding: 14px 15px;
  border-radius: 10px;

  .collateral-diagram {
    .diagram {
      max-width: 140px;
    }

    .copyIcon {
      font-weight: 600;
    }
  }
`
