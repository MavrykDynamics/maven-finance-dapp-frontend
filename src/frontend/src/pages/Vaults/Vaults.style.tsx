import styled from 'styled-components/macro'

// components
import { Card } from 'styles'

// types
import { MavrykTheme } from '../../styles/interfaces'

export const VaultsStyled = styled.div<{ theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.containerColor};
`

export const VaultsSearchFilterStyled = styled(Card)`
  display: flex;

  input {
    width: 320px;
  }

  .dd-container {
    display: grid;
    grid-template-columns: 70px 180px 180px 180px;
    column-gap: 20px;

    h4 {
      margin: 0;
    }

    .dd-item {
      div {
        width: 180px;
      }
    }
  }
`