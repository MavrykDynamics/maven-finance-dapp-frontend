import styled from 'styled-components/macro'
import { MavrykTheme } from '../../styles/interfaces'

export const LoansStyled = styled.div<{ theme: MavrykTheme }>``

export const MarketChartsContainer = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  justify-content: center;
  column-gap: 40px;
  margin-top: 30px;

  .chart-wrapper {
    width: 45%;
    max-width: 450px;
    display: flex;
    flex-direction: column;
    row-gap: 10px;

    .chart {
      width: 100%;
      height: 270px;
      position: relative;
      background: ${({ theme }) => theme.containerColor};
      border: 1px solid ${({ theme }) => theme.cardBorderColor};
      border-radius: 10px;
    }

    .summary {
      display: flex;
      flex-direction: column;
      row-gap: 10px;
      align-items: center;
      color: ${({ theme }) => theme.textColor};
      font-weight: 600;
      font-size: 16px;

      p {
        margin: 0;
        color: ${({ theme }) => theme.dataColor};
        font-weight: 700;
        font-size: 25px;
      }
    }

    .chart-interval {
      position: absolute;
      top: 15px;
      left: 15px;
      font-weight: 600;
      font-size: 10px;
      line-height: 18px;
      font-weight: 600;
      font-size: 10px;
      line-height: 18px;
      color: ${({ theme }) => theme.textColor};
    }
  }

  .loan-chart {
    background-color: ${({ theme }) => theme.containerColor};
    border: 1px solid ${({ theme }) => theme.cardBorderColor};
    border-radius: 10px;
  }

  &.earn-borrow-chart {
    column-gap: 150px;

    .chart-wrapper {
      width: fit-content;
    }

    .chart {
      height: fit-content;
    }
  }
`

export const MarketsOverviewContainer = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  flex-direction: column;
  margin-top: 30px;
  row-gap: 20px;
`

export const MarketOverview = styled.div<{ theme: MavrykTheme }>`
  position: relative;
  display: flex;
  flex-direction: column;

  .asset-info {
    display: flex;
    padding: 12px 20px;
    align-items: center;
    column-gap: 8px;
    max-width: 313px;
    background-color: ${({ theme }) => theme.backgroundColor};
    border: 1px solid ${({ theme }) => theme.cardBorderColor};
    border-bottom: none;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;

    svg,
    .icon,
    .img-wrapper {
      width: 36px;
      height: 36px;
      fill: ${({ theme }) => theme.dataColor};

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    > div,
    p {
      font-weight: 600;
      font-size: 18px;
      color: ${({ theme }) => theme.dataColor};
    }

    .rate {
      margin-left: auto;
    }
  }

  .content-wrapper {
    border: 1px solid ${({ theme }) => theme.cardBorderColor};
    border-radius: 10px;
    border-top-left-radius: 0px;
    background-color: ${({ theme }) => theme.containerColor};

    position: relative;
    padding: 0 20px;

    &::after {
      content: '';
      width: calc(100% - 40px);
      height: 1px;
      background-color: ${({ theme }) => theme.cardBorderColor};
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }

    .row {
      height: 100px;
      display: grid;
      grid-template-columns: 0.65fr 0.6fr 0.8fr 0.5fr 0.7fr 150px;
      padding-top: 25px;

      .row-item {
        p {
          margin: 0;
        }

        .name {
          font-weight: 600;
          font-size: 14px;
          line-height: 20px;
          color: ${({ theme }) => theme.textColor};
        }

        .value {
          font-weight: 600;
          font-size: 16px;
          line-height: 20px;
          color: ${({ theme }) => theme.dataColor};

          &.up {
            color: ${({ theme }) => theme.upColor};
          }

          &.down {
            color: ${({ theme }) => theme.downColor};
          }
        }

        .rate {
          font-weight: 400;
          font-size: 12px;
          line-height: 14px;
          color: ${({ theme }) => theme.dataColor};
        }
      }
    }
  }
`

export const MarketPagination = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 45px;

  .right-side-wrapper {
    display: flex;
    column-gap: 30px;

    span {
      font-weight: 600;
      font-size: 16px;
      line-height: 22px;
      display: flex;
      align-items: center;
      column-gap: 8px;
      color: ${({ theme }) => theme.valueColor};

      svg {
        height: 24px;
        width: 10px;
        stroke: ${({ theme }) => theme.valueColor};
      }

      &.right {
        svg {
          transform: rotate(-180deg);
        }
      }

      &::first-letter {
        font-size: 25px;
      }
    }
  }
`

export const MarketStyled = styled.div<{ theme: MavrykTheme }>`
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  row-gap: 50px;

  .gen-info {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .value {
      font-weight: 700;
      font-size: 25px;
      line-height: 30px;
      justify-content: center;
    }

    .name {
      text-align: center;
      line-height: 23px;
    }

    .asset-info {
      display: flex;
      column-gap: 8px;

      svg,
      .img-wrapper {
        width: 53px;
        height: 53px;
        fill: ${({ theme }) => theme.dataColor};

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .text-wrapper {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        color: ${({ theme }) => theme.dataColor};

        .symbol {
          font-weight: 600;
          font-size: 14px;
          line-height: 23px;
        }

        .full-name {
          font-weight: 700;
          font-size: 25px;
          line-height: 30px;
          text-transform: capitalize;
        }
      }
    }
  }

  .tabs-nav {
    display: flex;
    margin-top: 20px;
    column-gap: 10px;
  }
`

export const ThreeLevelListItem = styled.div<{ theme: MavrykTheme; customColor?: string }>`
  p {
    margin: 0;
  }

  &.right {
    .name {
      text-align: right;
    }

    .value {
      text-align: right;
      justify-content: flex-end;
    }
  }

  &.borrow-asset-header {
    display: flex;
    height: fit-content;
    column-gap: 7px;

    > svg,
    .img-wrapper {
      width: 38px;
      height: 38px;
      fill: ${({ theme }) => theme.dataColor};

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .data {
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      > .value {
        &:first-child {
          text-transform: capitalize;
        }

        font-weight: 600;
        font-size: 18px;

        .tzAddressToClick {
          font-size: 16px;
        }

        p {
          margin: 0;
        }

        svg {
          width: 14px;
          height: 14px;
          stroke: ${({ theme }) => theme.dataColor};
        }
      }
    }
  }

  .name {
    font-weight: 600;
    font-size: 14px;
    line-height: 21px;
    color: ${({ theme }) => theme.textColor};
  }

  .value {
    font-weight: 600;
    font-size: 16px;
    line-height: 22px;
    color: ${({ theme }) => theme.dataColor};
    display: flex;
    align-items: center;

    .img-wrapper,
    .no-icon {
      width: 24px;
      height: 24px;
      margin-right: 5px;

      img,
      svg {
        fill: ${({ theme }) => theme.dataColor};
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    &.up {
      color: ${({ theme }) => theme.upColor};
    }

    &.down {
      color: ${({ theme }) => theme.downColor};
    }

    &.neutral {
      fill: ${({ theme }) => theme.dataColor};
    }
  }

  .rate {
    font-style: normal;
    font-weight: 500;
    font-size: 14px;
    line-height: 18px;
    color: ${({ theme }) => theme.dataColor};
  }

  .tooltip {
    margin-left: 7px;
    display: inline-flex;
  }

  &.collateral-diagram {
    max-width: 200px;

    .percentage {
      width: 100%;
      display: flex;
      justify-content: space-between;
      font-weight: 600;
      font-size: 14px;
      line-height: 21px;
      margin-bottom: 7px;
      color: ${({ theme, customColor }) => customColor ?? theme.textColor};

      p {
        margin-left: 5px;
      }
    }

    .copyIcon {
      font-weight: 600;
    }
  }
`

export const FillBlock = styled.div<{ theme: MavrykTheme; width: number }>`
  width: 220px;
  height: 8px;
  border-radius: 10px;
  display: flex;
  justify-content: flex-end;
  position: relative;
  margin: 3px 0 4px 0;
  background-color: rgba(80, 62, 170, 0.5);

  .colored {
    position: absolute;
    border-radius: 10px;
    left: -1px;
    top: 50%;
    transform: translateY(-50%);
    width: ${({ width }) => 100 - width}%;
    height: 8px;
    background: linear-gradient(90deg, rgba(3, 212, 99, 1) 0%, rgba(255, 78, 67, 1) 100%);
  }
`

export const TransactionHistoryStyled = styled.div<{ theme: MavrykTheme }>`
  .main {
    border-radius: 10px;
    background-color: ${({ theme }) => theme.backgroundColor};
    padding: 30px;
  }
`
