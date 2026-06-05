import styled from 'styled-components'
import { MavenTheme } from '../../../styles/interfaces'
import {Card, FontSize, FontWeight} from 'styles'

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 30px;
`

export const DoormanExitFeeCurrentValues = styled.div<{ theme: MavenTheme }>`
  display: flex;
  flex-direction: column;
  row-gap: 10px;

  position: absolute;
  right: 20px;
  top: 20px;

  .row {
    display: flex;
    column-gap: 15px;
    justify-content: space-between;

    p {
      margin: 0;
    }

    .name {
      font-weight: ${FontWeight.semibold};
      font-size: ${FontSize.sm};
      color: ${({ theme }) => theme.subHeadingText};
    }

    .value {
      font-weight: ${FontWeight.semibold};
      font-size: ${FontSize.sm};
      color: ${({ theme }) => theme.primaryText};
    }
  }
`

export const DoormanChartCard = styled(Card)<{ theme: MavenTheme; $isExitFeeChart: boolean }>`
  padding: ${({ $isExitFeeChart }) => ($isExitFeeChart ? '40px 15px 5px 15px' : '50px 15px 5px 15px')};
  margin-top: 20px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  > div {
    color: ${({ theme }) => theme.subHeadingText};
    font-weight: ${FontWeight.medium};
    font-size: ${FontSize.sm};
  }

  .chart-legend {
    background-color: ${({ theme }) => theme.cards};
    opacity: 0.8;
    z-index: 15;
    padding: 3px;
    border-radius: 5px;
  }

  .mli-label {
    position: absolute;
    bottom: 40px;
    right: 25px;
  }

  .fee-label {
    position: absolute;
    top: 20px;
    left: 35px;
  }

  .double-chart-legend {
    position: absolute;
    top: 15px;
    left: 25px;
    display: flex;
    flex-direction: column;
    row-gap: 5px;

    .row {
      display: flex;
      align-items: center;
      column-gap: 7px;
      font-size: ${FontSize.sm};
      color: ${({ theme }) => theme.subHeadingText};

      &.mvn {
        .circle {
          background: ${({ theme }) => theme.primaryChartColor};
        }
      }

      &.smvn {
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
