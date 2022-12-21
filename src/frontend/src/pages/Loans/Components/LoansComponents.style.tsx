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
