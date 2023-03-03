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

  .manage-btn {
    display: flex;
    width: 250px;
    justify-content: center;
    margin: 30px auto 0 auto;
  }

  .buttons-wrapper {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 10px;
    margin-top: 60px;
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

  .collateral-list {
    padding-bottom: 20px;
    overscroll-behavior: contain;
    display: flex;
    flex-direction: column;
    row-gap: 45px;
  }

  .creating-vault-loader-wrapper {
    margin: 0 auto;
    margin-top: 10px;
    margin-bottom: -30px;
    display: flex;
    justify-content: center;
    column-gap: 15px;
    font-weight: 500;
    font-size: 12px;
    line-height: 21px;
    color: ${({ theme }) => theme.textColor};
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
          height: 12px;
          width: 12px;
        }
      }
    }
  }

  .add-collateral-inline {
    margin-top: 20px;
    font-weight: 600;
    font-size: 16px;
    line-height: 20px;
  }
`

export const VaultModalOverview = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  justify-content: space-between;
  border: 1px solid ${({ theme }) => theme.cardBorderColor};
  padding: 14px 15px 24px 20px;
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

export const DropDownJsxChild = styled.div`
  width: 95%;
  align-items: center;
  display: flex;
  justify-content: space-between;

  .flex-row {
    display: flex;
    align-items: center;
    column-gap: 10px;
    font-weight: 500;
    font-size: 16px;
    color: ${({ theme }) => theme.textColor};

    &.with-image {
      svg,
      .img-wrapper {
        width: 24px;
        height: 24px;
        fill: ${({ theme }) => theme.textColor};

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }
  }

  .baker-fee {
    font-weight: 600;
    font-size: 14px;
    line-height: 21px;
    color: ${({ theme }) => theme.dataColor};
  }
`
