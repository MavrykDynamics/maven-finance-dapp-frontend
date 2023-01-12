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
      padding: 0 30px;
      grid-template-columns: 185px 210px 120px 120px 0.4fr 0.4fr;
      column-gap: 40px;
    }
  }

  .tabSwitcher {
    margin-bottom: 0;
    width: 175px; 
  }
`

export const VaultsSearchFilterStyled = styled(Card)`
  padding: 20px 30px;
  margin: 20px 0;
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

export const VaultsCardDropDown = styled.div<{ theme: MavrykTheme }>`
  padding: 30px;
  padding-bottom: 0;

  font-weight: 600;
  font-size: 14px;
  line-height: 21px;

  .body {
    display: grid;
    grid-template-columns: 50% 50%;

    h1 {
      margin: 0;
      margin-bottom: 30px;
    }

    .left-part {
      padding-right: 30px;

      .group {
        display: flex;
        justify-content: space-between;
        margin-bottom: 30px;

        > div {
          min-width: 130px;
        }

        &:last-of-type {
          margin-bottom: 10px;
        }
      }
    }

    .right-part {
      padding-left: 30px;
      border-left: 1px solid ${({ theme }) => theme.cardBorderColor};
    }

    .value {
      font-weight: 600;
      font-size: 16px;
      line-height: 22px;

      color: ${({ theme }) => theme.dataColor};

      p {
        margin: 0;
      }
    }

    .title {
      display: flex;
      align-items: center;
    }

    .info-icon {
      margin-left: 4px;
      width: 12px;
      height: 12px;
      fill: ${({ theme }) => theme.textColor};
    }
  }

  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 0;
    margin-top: 30px;
    border-top: 1px solid ${({ theme }) => theme.cardBorderColor};

    button {
      width: 250px;
    }
  }
`