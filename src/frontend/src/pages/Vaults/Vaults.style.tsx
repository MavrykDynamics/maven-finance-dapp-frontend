import styled from 'styled-components/macro'

// components
import { Card } from 'styles'

// types
import { MavrykTheme } from '../../styles/interfaces'

export const VaultsStyled = styled.div<{ theme: MavrykTheme }>`
  .group-with-icon {
    display: flex;

    > svg {
      margin-right: 10px;
      width: 36px;
      height: 36px;
    }
  }

  .expand {
    margin-top: 10px;

    .expand-header {
      padding: 0 35px;
      grid-template-columns: 0.6fr 1fr 0.6fr 0.6fr 0.4fr 0.4fr;
      column-gap: 40px;
    }
  }

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

export const VaultsCardTitleTextGroup = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  row-gap: 5px;

  > h2 {
    height: 18px;
    font-weight: 600;
    font-size: 18px;
    color: ${({ theme }) => theme.dataColor};
    text-transform: capitalize;

    &::after {
      height: 0;
    }
  }

  > h3 {
    font-weight: 600;
    font-size: 14px;
    line-height: 21px;
    color: ${({ theme }) => theme.textColor};
    text-transform: capitalize;
  }

  .header-value {
    color: ${({ theme }) => theme.dataColor};

    p {
      margin: 0;
    }
  }

  .ratio {
    height: 14px;
  }
`