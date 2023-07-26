import styled from 'styled-components'
import { MavrykTheme } from 'styles/interfaces'

export const LoansModalBase = styled.div<{ theme: MavrykTheme }>`
  h2 {
    font-size: 22px;
  }

  .useMax-btn {
    button {
      font-size: 14px;
    }
  }

  .modalDescr {
    margin-top: 7px;
    font-weight: 600;
    font-size: 14px;
    line-height: 21px;
    color: ${({ theme }) => theme.textColor};
    margin-bottom: 30px;

    p {
      margin: 0;
    }
  }

  .block-name {
    font-weight: 600;
    font-size: 14px;
    line-height: 21px;
    color: ${({ theme }) => theme.textColor};
    padding-left: 7px;
    padding-bottom: 3px;
  }

  .confirmation-btn {
    margin: 55px auto 0;
    width: 300px;
  }

  .manage-btn {
    display: flex;
    width: 250px;
    justify-content: center;
    margin: 30px auto 0 auto;
  }

  .repayFull-banner {
    margin-top: 30px;
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
    overscroll-behavior: contain;
    display: flex;
    flex-direction: column;
    row-gap: 50px;
    margin-bottom: 10px;
    min-height: 100px;
    max-height: 250px;
    overflow-y: auto;
    overflow-x: hidden;

    -ms-overflow-style: none; /* Internet Explorer 10+ */
    scrollbar-width: none; /* Firefox */
    padding-right: 18px;
  }

  .collateral-list::-webkit-scrollbar {
    display: none; /* Safari and Chrome */
  }

  .xtz-baker {
    margin: 30px 0 -20px 0;
  }

  .collateral-block {
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

  .confirm-create-vault {
    display: grid;
    grid-template-columns: minmax(33%, 1.2fr) minmax(33%, 1.2fr) 1fr;
    margin-top: 20px;
    column-gap: 30px;
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
