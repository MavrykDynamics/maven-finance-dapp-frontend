import styled from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'
import { Card } from 'styles'

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 30px;
`

export const DoormanExitFeeCurrentValues = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  flex-direction: column;
  row-gap: 10px;

  position: absolute;
  right: 20px;
  top: 15px;

  .row {
    display: flex;
    column-gap: 15px;
    justify-content: space-between;

    p {
      margin: 0;
    }

    .name {
      font-weight: 600;
      font-size: 12px;
      color: ${({ theme }) => theme.subHeadingText};
    }

    .value {
      font-weight: 600;
      font-size: 12px;
      color: ${({ theme }) => theme.primaryText};
    }
  }
`

export const DoormanChartCard = styled(Card)<{ theme: MavrykTheme }>`
  padding: 40px 15px 0px 15px;
  margin-top: 20px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  // Use z-index with hover
  // Because in this block, there’s a canvas that overrides the CustomTooltip from the next block.
  // But when we’re inside the chart, we want the ChartTooltip to overrides the neighboring blocks.
  // Task - [MAV-1279]
  z-index: 0;

  &:hover {
    z-index: 1;
  }

  > div {
    color: ${({ theme }) => theme.subHeadingText};
    font-weight: 500;
    font-size: 12px;
  }

  .chart-legend {
    background-color: ${({ theme }) => theme.cards};
    opacity: 0.9;
    z-index: 15;
    padding: 3px;
    border-radius: 5px;
  }

  .mli-label {
    position: absolute;
    bottom: 55px;
    right: 25px;
  }

  .fee-label {
    position: absolute;
    top: 20px;
    left: 35px;
  }

  .double-chart-legend {
    position: absolute;
    top: 65px;
    left: 25px;
    display: flex;
    flex-direction: column;
    row-gap: 5px;

    .row {
      display: flex;
      align-items: center;
      column-gap: 7px;
      font-size: 12px;
      color: ${({ theme }) => theme.subHeadingText};

      &.mvk {
        .circle {
          background: ${({ theme }) => theme.primaryChartColor};
        }
      }

      &.smvk {
        .circle {
          // constant color for all theme
          background: #86d4c9;
        }
      }
    }

    .circle {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }
  }
`
