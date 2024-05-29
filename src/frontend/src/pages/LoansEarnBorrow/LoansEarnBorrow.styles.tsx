import styled from 'styled-components'
import { CardHover } from 'styles'
import { MavenTheme } from 'styles/interfaces'

export const LoansEarnBorrowStyled = styled.div<{ theme: MavenTheme }>`
  margin-top: 30px;
`

export const EarnBorrowChartStyled = styled.div<{ theme: MavenTheme; $isChartLoading: boolean }>`
  position: relative;
  margin: 23px 0 30px 0;
  height: 152px;

  border: 1px solid ${({ theme }) => theme.strokeCards};
  border-radius: 10px;

  & > div:last-child {
    position: ${({ $isChartLoading }) => ($isChartLoading ? 'absolute' : 'relative')};
    position: ${({ $isChartLoading }) => ($isChartLoading ? '0' : '3px')};
  }

  .switchMenu {
    display: flex;
    justify-content: space-between;
    margin: 10px 10px 5px 10px;
    height: 30px;

    font-weight: 600;
    font-size: 10px;

    color: ${({ theme }) => theme.regularText};

    svg {
      position: relative;
      top: 1px;
      left: 2px;

      width: 30px;
      height: 30px;
    }
  }

  .chartPlug {
    row-gap: 0;

    p {
      font-size: 14px;
    }
  }
`

export const EarnBorrowCards = styled.div<{ theme: MavenTheme }>`
  display: flex;
  flex-wrap: wrap;
  margin-top: 20px;
  gap: 20px;
`

export const EarnBorrowCardStyled = styled(CardHover)<{ theme: MavenTheme }>`
  padding: 0;
  margin: 0;

  width: 350px;
`

export const EarnBorrowCardHeader = styled.div<{ theme: MavenTheme }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;

  color: ${({ theme }) => theme.primaryText};
  background-color: ${({ theme }) => theme.backgroundColor};
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  border-bottom: 1px solid ${({ theme }) => theme.divider};

  img,
  svg {
    width: 36px;
    height: 36px;

    margin-right: 10px;
  }

  svg {
    fill: ${({ theme }) => theme.primaryText};
  }

  h4 {
    text-transform: uppercase;

    font-weight: 600;
    font-size: 22px;
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

export const EarnBorrowCardBody = styled.div<{ theme: MavenTheme }>`
  padding: 20px 20px 30px 20px;

  .info {
    display: flex;
    justify-content: space-between;

    font-weight: 600;
    font-size: 14px;
    line-height: 21px;

    color: ${({ theme }) => theme.subHeadingText};

    p {
      margin: 0;
      color: ${({ theme }) => theme.primaryText};

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
    margin-top: 30px;

    span {
      text-transform: uppercase;
    }

    .arrowIcon {
      width: 14px;
      height: 14px;

      fill: ${({ theme }) => theme.linksAndButtons};
    }
  }
`
