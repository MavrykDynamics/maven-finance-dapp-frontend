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
`
