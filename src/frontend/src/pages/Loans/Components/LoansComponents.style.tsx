import styled from 'styled-components'
import { MavrykTheme } from 'styles/interfaces'

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
  }
`

export const LendingTabListItem = styled.div<{ theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.containerColor};
  border-radius: 10px;
  padding: 18px 20px;
  display: grid;
  grid-template-columns: 0.8fr 0.8fr 0.8fr 1fr 1fr 1fr 125px 125px;
  column-gap: 10px;
  border: 1px solid ${({ theme }) => theme.cardBorderColor};

  .go-back-btn {
    background: transparent;
    max-width: 140px;
    border: 1px solid ${({ theme }) => theme.valueColor};
    color: ${({ theme }) => theme.valueColor};
    font-weight: 600;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
      transform: rotate(180deg);
      width: 18px;
      stroke: ${({ theme }) => theme.valueColor};
      fill: ${({ theme }) => theme.valueColor};
    }
  }
`

export const BorrowingTabListItemExpanded = styled.div<{ theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.backgroundColor};
  border-radius: 10px;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;

  .block-name {
    font-weight: 600;
    font-size: 18px;
    color: ${({ theme }) => theme.textColor};
    margin-bottom: 10px;

    &.margin-top {
      margin-top: 30px;
    }
  }

  .list {
    display: flex;
    flex-direction: column;
    row-gap: 20px;

    &.borrow {
      margin-bottom: 25px;
    }

    .list-item {
      display: grid;
      grid-template-columns: 0.5fr 0.5fr 0.5fr 0.5fr 1fr;

      &.collateral {
        position: relative;
        grid-template-columns: 0.5fr 0.5fr 0.5fr 0.5fr 160px 160px;

        &:not(:first-child)::before {
          position: absolute;
          top: -12px;
          content: '';
          background-color: ${({ theme }) => theme.cardBorderColor};
          left: -20px;
          width: calc(100% + 40px);
          height: 1px;
        }
      }

      button {
        margin-left: auto;
        max-width: 140px;
      }
    }
  }

  .go-back-btn {
    background: transparent;
    max-width: 140px;
    border: 1px solid ${({ theme }) => theme.valueColor};
    color: ${({ theme }) => theme.valueColor};
    font-weight: 600;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
      transform: rotate(180deg);
      width: 18px;
      stroke: ${({ theme }) => theme.valueColor};
      fill: ${({ theme }) => theme.valueColor};
    }
  }
`
