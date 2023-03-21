import styled from 'styled-components'
import { CardHover } from 'styles'
import { MavrykTheme } from 'styles/interfaces'

export const LoansEarnBorrowStyled = styled.div<{ theme: MavrykTheme }>``

export const EarnBorrowChartStyled = styled.div<{ theme: MavrykTheme }>`
  margin: 30px 0;
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: 10px;

  .switchMenu {
    display: flex;
    justify-content: space-between;
    margin: 10px 10px 5px 10px;
    height: 30px;

    font-weight: 600;
    font-size: 10px;

    color: ${({ theme }) => theme.textColor};

    svg {
      position: relative;
      top: 1px;
      left: 2px;
      
      width: 30px;
      height: 30px;
    }
  }

  &.isGraph {
    svg {
      fill: ${({ theme }) => theme.lPurple_dPurple_lPuprple};
    }
  }
`

export const EarnBorrowCards = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  flex-wrap: wrap;
  margin-top: 20px;
`

export const EarnBorrowCardStyled = styled(CardHover)<{ theme: MavrykTheme }>`
  padding: 0;
  margin: 0;

  width: 350px;
`

export const EarnBorrowCardHeader = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;

  color: ${({ theme }) => theme.dataColor};
  background-color: ${({ theme }) => theme.backgroundColor};
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  border-bottom: 1px solid ${({ theme }) => theme.borderColor};

  h4,
  span {
    font-weight: 600;
    font-size: 22px;
  }

  img,
  svg {
    width: 36px;
    height: 36px;

    margin-right: 10px;
  }

  svg {
    fill: ${({ theme }) => theme.dataColor};
  }

  h4 {
    text-transform: capitalize;
  }

  span {
    text-transform: uppercase;
  }

  .commaNumber {
    margin: 0;

    font-weight: 600;
    font-size: 18px;
  }

  .flex {
    display: flex;
    align-items: center;
  }
`

export const EarnBorrowCardBody = styled.div<{ theme: MavrykTheme }>`
  padding: 20px 20px 30px 20px;

  .info {
    display: flex;
    justify-content: space-between;

    font-weight: 600;
    font-size: 14px;
    line-height: 21px;

    color: ${({ theme }) => theme.textColor};

    p {
      margin: 0;
      color: ${({ theme }) => theme.dataColor};

      font-weight: 600;
      font-size: 16px;
      line-height: 22px;
    }
  }

  .buttons {
    display: flex;
    flex-direction: column;
    align-items: center;
    row-gap: 20px;
    padding: 0 30px;

    span {
      text-transform: uppercase;
    }

    .arrowIcon {
      width: 14px;
      height: 14px;

      fill: ${({ theme }) => theme.dataColor};
    }
  }
`
