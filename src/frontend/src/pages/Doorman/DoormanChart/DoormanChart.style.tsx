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
      color: ${({ theme }) => theme.textColor};
    }

    .value {
      font-weight: 600;
      font-size: 12px;
      color: ${({ theme }) => theme.dataColor};
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
    color: ${({ theme }) => theme.textColor};
    font-weight: 500;
    font-size: 12px;
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
    top: 20px;
    left: 20px;
    display: flex;
    flex-direction: column;
    row-gap: 5px;

    .row {
      display: flex;
      align-items: center;
      column-gap: 7px;
      font-size: 12px;
      color: ${({ theme }) => theme.textColor};

      &.mvk {
        .circle {
          background: ${({ theme }) => theme.dataColor};
        }
      }

      &.smvk {
        .circle {
          background: ${({ theme }) => theme.valueColor};
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
