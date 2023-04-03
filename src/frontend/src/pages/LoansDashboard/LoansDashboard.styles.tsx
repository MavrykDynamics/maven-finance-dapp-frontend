import { SmallBlockBase } from 'pages/DashboardPersonal/DashboardPersonalComponents/DashboardPersonalComponents.style'
import styled from 'styled-components'
import { MavrykTheme } from 'styles/interfaces'

export const LoansDashboardStyled = styled.div`
  margin-top: 30px;

  p {
    margin: 0;
  }

  .top {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;

    .label {
      font-weight: 600;
      font-size: 14px;
      color: ${({ theme }) => theme.textColor};
    }

    .value-wrap {
      width: fit-content;

      > * {
        width: fit-content;
      }
    }

    .value {
      font-weight: 600;
      font-size: 18px;
      color: ${({ theme }) => theme.dataColor};
      margin-top: 3px;
    }

    .diff {
      margin-left: auto;
      font-weight: 600;
      font-size: 14px;
      width: fit-content;
      margin-top: 3px;

      &.up {
        color: ${({ theme }) => theme.upColor};
      }

      &.down {
        color: ${({ theme }) => theme.downColor};
      }

      &.neutral {
        color: ${({ theme }) => theme.dataColor};
      }
    }
  }

  .position {
    height: fit-content;
    padding-right: 30px;
    padding-bottom: 15px;
  }
`

export const TotalVolumeStyled = styled(SmallBlockBase)<{ theme: MavrykTheme }>`
  background-image: url('/images/lendBorrowTotalVolume.svg?v=0'), ${({ theme }) => theme.dashboardTvlGradient};
  background-size: cover;
  background-repeat: no-repeat;

  .total-amount {
    margin-top: 25px;
    font-weight: 600;
    font-size: 32px;
    color: ${({ theme }) => theme.dataColor};
  }

  .details {
    margin-top: 25px;
    display: flex;
    column-gap: 35px;

    .value {
      margin-top: 7px;
    }
  }
`

export const AccountStyledStyled = styled(SmallBlockBase)<{ theme: MavrykTheme }>`
  background-image: ${({ theme }) => theme.dashboardTvlGradient};
  background-size: cover;
  background-repeat: no-repeat;

  .content {
    display: flex;
    column-gap: 50px;
  }

  .gauge-chart {
    margin-top: 25px;
    width: 125px;
    height: 125px;
    display: flex;

    position: relative;

    .tooltip {
      position: absolute;
      right: 0px;
      top: 0px;
      z-index: 100;
    }
  }

  .details {
    margin-top: 15px;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;

    .value {
      font-size: 22px;
    }
  }
`

export const PositionTableStyled = styled.div<{ theme: MavrykTheme }>`
  .no-markets-table-data {
    margin: 20px 0;

    p {
      margin-top: 10px;
    }
  }
`
