import styled from 'styled-components'
import { cyanColor } from 'styles'
import { MavrykTheme } from 'styles/interfaces'

export const SmallBlockBase = styled.div<{ theme: MavrykTheme }>`
  width: calc(50% - 10px);
  height: 235px;
  background-color: ${({ theme }) => theme.containerColor};
  border: 1px solid ${({ theme }) => theme.cardBorderColor};
  border-radius: 10px;
  padding: 30px;

  h2 {
    font-size: 22px;
  }

  .name {
    font-weight: 600;
    font-size: 14px;
    color: ${({ theme }) => theme.textColor};
  }

  .value {
    font-size: 16px;
    font-weight: 600;
    color: ${({ theme }) => theme.dataColor};
  }
`

export const MediumBlockBase = styled(SmallBlockBase)<{ theme: MavrykTheme }>`
  height: 361px;
  display: flex;
  flex-direction: column;

  .no-data {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    row-gap: 15px;

    .nav-button {
      width: 220px;
    }

    span {
      font-weight: 600;
      font-size: 18px;
      color: ${({ theme }) => theme.textColor};
    }
  }
`

export const PortfolioChartStyled = styled(MediumBlockBase)<{ theme: MavrykTheme }>`
  width: 810px;
  padding-bottom: 10px;
  position: relative;

  .chart-periods {
    position: absolute;
    top: 30px;
    right: 30px;
    width: 250px;

    button {
      width: 20%;
      font-size: 14px;
      padding-left: 10px;
      padding-right: 10px;

      &.selected {
        background: linear-gradient(90deg, #86d4c9 0.31%, #8d86eb 99.97%);
      }
    }
  }

  .last-seria {
    position: absolute;
    left: 30px;
    top: 75px;
    display: flex;
    flex-direction: column;
    color: ${({ theme }) => theme.dataColor};
    .mvk {
      font-weight: 600;
      font-size: 27px;

      .suffix {
        color: ${({ theme }) => theme.textColor};
      }
    }

    .usd {
      font-weight: 600;
      font-size: 16px;
    }

    p {
      margin: 0;
    }
  }

  .chart {
    margin-top: auto;
    height: 230px;
  }
`

export const PortfolioWalletStyled = styled(MediumBlockBase)<{ theme: MavrykTheme }>`
  width: 260px;

  .wallet-info {
    display: flex;
    flex-direction: column;
    row-gap: 7px;
    margin-top: 30px;

    .name {
      font-weight: 600;
      font-size: 14px;
      color: ${({ theme }) => theme.textColor};
    }

    .value {
      font-weight: 600;
      font-size: 16px;
      color: ${({ theme }) => theme.dataColor};
      display: flex;
      column-gap: 10px;
      align-items: center;
    }
  }
`

export const MyRewardsStyled = styled(SmallBlockBase)<{ theme: MavrykTheme }>`
  background-image: url('/images/dashboard/dashboardPersonalMyRewards.svg?v=0'),
    ${({ theme }) => theme.dashboardTvlGradient};
  background-size: cover;
  background-repeat: no-repeat;

  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 40px 55px;
  column-gap: 45px;
  row-gap: 25px;

  > div {
    align-items: flex-end;
  }

  .claim-rewards {
    margin-top: -10px;
    margin-left: auto;
  }

  .stat-block {
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    .name {
      font-weight: 600;
      font-size: 14px;
      color: ${({ theme }) => theme.textColor};
    }

    .value {
      font-weight: 700;
      font-size: 25px;
      color: ${({ theme }) => theme.dataColor};
      display: flex;
      align-items: flex-end;
      .suffix {
        font-weight: 600;
        font-size: 14px;
        color: ${({ theme }) => theme.textColor};
      }
    }
  }
`
export const EarnHistoryStyled = styled(SmallBlockBase)<{ theme: MavrykTheme }>`
  .top {
    display: flex;
    justify-content: space-between;
  }

  .grid {
    display: grid;
    grid-template-rows: 47px 47px;
    grid-template-columns: 0.55fr 0.45fr;
    margin-top: 25px;
    row-gap: 18px;
  }

  .stat-block {
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    > div {
      font-weight: 600;
    }
  }
`

export const LBHInfoBlock = styled(MediumBlockBase)<{ theme: MavrykTheme }>`
  width: 100%;
  padding-right: 0px;
  position: relative;

  p {
    margin: 0;
  }

  .loader-wrapper {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .view-markets {
    position: absolute;
    top: 30px;
    right: 30px;
  }

  .acc-stats {
    margin-top: 30px;
    display: flex;
    align-items: center;

    .stats {
      margin-left: 60px;
      display: flex;
      align-items: center;
      column-gap: 110px;

      .name {
        font-weight: 600;
        font-size: 14px;
      }

      .value {
        margin-top: 7px;
        font-weight: 700;
        font-size: 25px;
      }
    }
  }

  &.position-tab {
    height: fit-content;
    padding-right: 30px;
  }
`

export const HistoryBlock = styled(MediumBlockBase)<{ theme: MavrykTheme }>`
  width: 100%;
  max-height: 712px;
  height: fit-content;

  .no-data {
    margin-top: 20px;
  }

  .history-tooltip {
    svg {
      width: 13px;
      height: 13px;
    }
  }
`

export const VestingTabStyled = styled(MediumBlockBase)<{ theme: MavrykTheme }>`
  width: 100%;
  height: 187px;
  padding-bottom: 20px;

  p {
    margin: 0;
  }

  .vesting-data {
    display: grid;
    grid-template-columns: repeat(5, auto) 140px;
    justify-content: space-between;
    align-items: center;
    grid-template-rows: 50px;
    margin-top: 30px;

    .column {
      display: flex;
      flex-direction: column;
      row-gap: 5px;
    }
  }
`

export const SatelliteStatusBlock = styled(MediumBlockBase)<{ theme: MavrykTheme }>`
  padding-bottom: 20px;
  width: 100%;
  height: 315px;

  .top-row {
    margin-top: 40px;
    display: flex;
    justify-content: space-between;
  }

  .bottom-row {
    margin-top: 25px;
    display: flex;
    column-gap: 80px;
    justify-content: center;
  }

  .grid-item {
    display: flex;
    flex-direction: column;
    row-gap: 5px;

    p {
      margin: 0;
    }

    a {
      font-weight: 500;
      font-size: 16px;
      color: ${({ theme }) => theme.valueColor};
    }

    &.info {
      flex-direction: row;

      .text {
        display: flex;
        flex-direction: column;
        row-gap: 5px;

        svg,
        .img-wrapper {
          width: 16px;
          height: 16px;
          fill: unset;
          stroke: ${({ theme }) => theme.dataColor};

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
      }

      > svg,
      .img-wrapper {
        height: 40px;
        width: 40px;
        fill: ${({ theme }) => theme.lPurple_dPurple_lPuprple};
        margin-right: 10px;

        img {
          border-radius: 50%;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }
  }

  > a {
    margin: 0 auto;
    margin-top: auto;
    font-weight: 500;
    font-size: 14px;
    color: ${({ theme }) => theme.valueColor};
    position: relative;

    &::before {
      position: absolute;
      content: '';
      width: 1000px;
      top: -25px;
      left: 50%;
      transform: translateX(-50%);
      height: 1px;
      background: ${({ theme }) => theme.cardBorderColor};
      cursor: default;
    }
  }
`

export const DelegationStatusBlock = styled(SatelliteStatusBlock)<{ theme: MavrykTheme }>`
  height: 285px;
  .top-row {
    margin-top: 25px;
  }

  .delegated-to {
    font-weight: 600;
    font-size: 18px;
    line-height: 27px;
    color: ${({ theme }) => theme.textColor};
    margin-top: 25px;
  }
`

export const DashboardPersonalTabStyled = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
`
