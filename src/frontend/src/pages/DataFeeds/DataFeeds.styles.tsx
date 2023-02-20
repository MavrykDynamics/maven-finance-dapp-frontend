import styled from 'styled-components/macro'
import { MavrykTheme } from 'styles/interfaces'

export const DataFeedsStyled = styled.section``

export const DataFeedsSearchFilter = styled.div<{ theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.containerColor};
  display: flex;
  align-items: center;
  padding: 16px 26px;
  margin-top: 30px;

  color: ${({ theme }) => theme.subTextColor};

  input {
    width: 320px;
    height: 40px;
    margin-left: 30px;
    max-width: 375px;
  }

  input {
    margin-left: 30px;
    max-width: 375px;
  }

  .dropDown {
    min-width: 330px;
  }

  button {
    max-width: 250px;

    svg {
      fill: transparent;
    }
  }
`
