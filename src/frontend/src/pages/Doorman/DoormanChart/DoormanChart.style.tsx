import styled from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'
import { Card } from 'styles'

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;

  .switcher {
    margin-top: 30px;
    width: fit-content;
    column-gap: 15px;
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
    left: 45px;
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
