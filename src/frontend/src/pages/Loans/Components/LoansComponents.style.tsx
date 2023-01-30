import styled from 'styled-components'
import { MavrykTheme } from 'styles/interfaces'
import { vaultsStatuses } from 'pages/Vaults/Vaults.consts' 

export const NoItemsInTabStyled = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  flex-direction: column;
  row-gap: 10px;
  margin-bottom: 30px;
  margin-top: 15px;
  align-items: center;

  span {
    font-weight: 600;
    font-size: 16px;
    color: ${({ theme }) => theme.textColor};
  }

  .lending-tab-no-items-btn {
    max-width: 250px;

    svg {
      stroke: unset;
    }
  }
`

export const LoansTabStyled = styled.div<{ theme: MavrykTheme }>`
  border: 1px solid ${({ theme }) => theme.cardBorderColor};
  background-color: ${({ theme }) => theme.containerColor};
  border-radius: 10px;
  padding: 30px;
  padding-bottom: 40px;
  position: relative;

  .has-items-borrow-btn {
    position: absolute;
    right: 30px;
    top: 20px;
    max-width: 250px;

    svg {
      stroke: unset;
    }
  }

  .list-wrapper {
    margin-top: 30px;
    display: flex;
    flex-direction: column;
    row-gap: 20px;
  }

  .factory-info {
    display: flex;
    column-gap: 10px;
    font-weight: 600;
    font-size: 14px;
    color: ${({ theme }) => theme.textColor};
    position: absolute;
    bottom: 10px;
    right: 30px;
  }
`

export const LendingTabListItem = styled.div<{ theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.containerColor};
  border-radius: 10px;
  padding: 18px 20px 8px 20px;
  display: grid;
  grid-template-columns: 0.8fr 0.8fr 0.8fr 1fr 1fr 1fr 125px 125px;
  column-gap: 10px;
  border: 1px solid ${({ theme }) => theme.cardBorderColor};

  .lending-btn {
    width: 120px;
    height: 36px;
    font-weight: 600;
    font-size: 16px;
    padding: 0;
    align-items: center;
    display: flex;

    svg {
      stroke-width: 0.5px;
    }
  }
`

export const BorrowingTabListItemExpanded = styled.div<{ theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.backgroundColor};
  border-radius: 10px;
  border-top-right-radius: 0;
  border-top-left-radius: 0;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  position: relative;

  .block-name {
    font-weight: 600;
    font-size: 18px;
    color: ${({ theme }) => theme.textColor};
    margin-bottom: 10px;

    &.margin-top {
      margin-top: 60px;
    }

    &.margin-top-20 {
      margin-top: 20px;
    }
  }

  .borrowed-data {
    display: flex;

    > div:not(.buttons-wrapper) {
      width: 17%;
    }

    .buttons-wrapper {
      display: flex;
      column-gap: 10px;
      margin-left: auto;

      button {
        width: 180px;

        &.repay {
          svg {
            height: 27px;
          }
        }
      }
    }
  }

  .bottom-info-row {
    display: flex;
    align-items: center;
    width: 400px;
    margin: 4px 0;

    .name {
      margin-right: 10px;
    }

    .value {
      color: ${({ theme }) => theme.dataColor};
      font-weight: 600;
      font-size: 14px;
    }

    button,
    a {
      margin-left: auto;
      padding: 0;
      height: fit-content;

      &:hover {
        opacity: 0.8;
        color: ${({ theme }) => theme.valueColor};

        svg {
          opacity: 0.8;
        }

        &::before {
          display: none;
        }
      }

      svg {
        height: 14px;
        width: 8px;
        transform: rotate(180deg);
        stroke-width: 2px;
        stroke: ${({ theme }) => theme.valueColor};
      }
    }
  }

  .close-vault {
    position: absolute;
    right: 18px;
    bottom: 20px;
    width: 250px;
    height: 36px;

    > div {
      display: flex;
      align-items: center;
    }

    svg {
      width: 15px;
      height: 15px;
    }
  }
`
export const StatusMessageStyled = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  padding: 15px 25px;
  margin-bottom: 20px;

  font-weight: 600;
  font-size: 14px;
  line-height: 21px;

  border-radius: 10px;
  background-color: ${({ theme }) => theme.darkPurpleColor};

  .timer {
    display: inline-block;
  }

  svg {
    display: block;
    margin: auto 0;
    margin-right: 20px;

    width: 20px;
    height: 20px;
  }

  & > div {
    p {
      margin: 0;
    }

    p:first-of-type {
      white-space: nowrap;
    }

  }

  &.${vaultsStatuses.LIQUIDATABLE} {
    border: 1px solid ${({ theme }) => theme.downColor};

    svg {
      fill: ${({ theme }) => theme.downColor};
    }
  }

  &.${vaultsStatuses.GRACE_PERIOD} {
    border: 1px solid ${({ theme }) => theme.darkWarningColor};

    svg {
      fill: ${({ theme }) => theme.darkWarningColor};
    }
  }

  &.${vaultsStatuses.AT_RISK} {
    border: 1px solid ${({ theme }) => theme.awaitingColor};

    svg {
      fill: ${({ theme }) => theme.awaitingColor};
    }
  }
`