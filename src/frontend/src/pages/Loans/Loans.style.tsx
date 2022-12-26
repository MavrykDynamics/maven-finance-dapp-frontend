import styled from 'styled-components/macro'
import { MavrykTheme } from '../../styles/interfaces'

export const LoansStyled = styled.div<{ theme: MavrykTheme }>``

export const MarketChartsContainer = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  justify-content: center;
  column-gap: 150px;
  margin-top: 30px;

  .chart-wrapper {
    width: 45%;
    max-width: 372px;
    display: flex;
    flex-direction: column;
    row-gap: 10px;

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
  }

  .loan-chart {
    background-color: ${({ theme }) => theme.containerColor};
    border: 1px solid ${({ theme }) => theme.cardBorderColor};
    border-radius: 10px;
  }
`

export const MarketsOverviewContainer = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  flex-direction: column;
  margin-top: 20px;
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
    .icon {
      width: 36px;
      height: 36px;

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
  margin-top: 45px;

  .go-back-btn {
    background: transparent;
    border: 1px solid ${({ theme }) => theme.valueColor};
    color: ${({ theme }) => theme.valueColor};
    font-weight: 600;
    font-size: 16px;
    padding: 17px 30px;
    display: flex;
    align-items: center;

    svg {
      transform: rotate(180deg);
      stroke: ${({ theme }) => theme.valueColor};
      fill: ${({ theme }) => theme.valueColor};
    }
  }

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
  row-gap: 25px;

  .gen-info {
    display: flex;
    justify-content: space-between;

    .asset-info {
      display: flex;
      column-gap: 8px;

      svg,
      .img-wrapper {
        width: 45px;
        height: 45px;

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
        }

        .full-name {
          font-weight: 700;
          font-size: 25px;
        }
      }
    }
  }

  .tabs-nav {
    display: flex;
    column-gap: 10px;
  }
`

export const ThreeLevelListItem = styled.div<{ theme: MavrykTheme }>`
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
    display: flex;
    align-items: center;

    svg {
      width: 24px;
      height: 24px;
      margin-right: 4px;
    }

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

  .info-tip {
    font-weight: 600;
    display: flex;
    align-items: center;
    font-size: 10px;
    column-gap: 5px;

    span {
      color: ${({ theme }) => theme.dataColor};
      font-weight: 600;
      font-size: 14px;
    }
  }
`

export const FillBlock = styled.div<{ theme: MavrykTheme; width: number }>`
  width: 220px;
  height: 7px;
  border-radius: 10px;
  display: flex;
  justify-content: flex-end;
  margin: 3px 0 4px 0;
  background: linear-gradient(90deg, rgba(3, 212, 99, 1) 0%, rgba(255, 78, 67, 1) 100%);
  .colored {
    width: ${({ width }) => 100 - width}%;
    background-color: ${({ theme }) => theme.backgroundColor};
  }
`

export const TransactionHistory = styled.div<{ theme: MavrykTheme }>`
  margin-top: 20px;
  border: 1px solid ${({ theme }) => theme.cardBorderColor};
  border-radius: 10px;
  background-color: ${({ theme }) => theme.containerColor};
  padding: 30px;

  .top {
    display: flex;
    justify-content: space-between;
  }
`
