import styled, { css } from 'styled-components'
import { MavrykTheme } from 'styles/interfaces'

export const GaugeChartStyled = styled.div<{ theme: MavrykTheme }>`
  position: relative;
  width: 125px;
  height: 125px;

  > svg {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
  }

  .colored-arc {
    width: 125px;
    z-index: 3;
    left: 0;
    transform: scale(-1, 1);
  }

  .backdrop {
    top: 3px;
    width: 118px;
    z-index: 1;
  }

  .arrow {
    width: 82px;
    height: 14px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%) rotate(0deg);
    z-index: 2;
    transition: transform 2s;

    svg {
      position: absolute;
      left: -10px;
      top: 50%;
      transform: translateY(-50%);
    }
  }
`

export const ValueWrapper = styled.div<{ theme: MavrykTheme }>`
  width: 82px;
  height: 82px;
  border-radius: 50%;

  display: flex;
  align-items: center;
  justify-content: center;

  background: ${({ theme }) => theme.dPurple_container_dPurple};
  color: ${({ theme }) => theme.dataColor};

  > * {
    color: ${({ theme }) => theme.dataColor};
  }

  .lend-borrow-position {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    row-gap: 3px;

    .amount {
      font-weight: 600;
      font-size: 22px;
    }

    .status {
      font-weight: 600;
      font-size: 10px;
    }

    &.low {
      > * {
        color: ${({ theme }) => theme.upColor};
      }
    }

    &.hight {
      > * {
        color: ${({ theme }) => theme.downColor};
      }
    }

    &.risk {
      > * {
        color: ${({ theme }) => theme.warningColor};
      }
    }
  }

  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;
`

export const ArrowStyled = styled.div<{ theme: MavrykTheme; angle: number }>`
  width: 82px;
  height: 14px;
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 2;
  transition: transform 500ms ease-in-out;

  ${({ angle }) =>
    css`
      transform: translate(-50%, -50%) rotate(${angle}deg);
    `}

  svg {
    position: absolute;
    left: -11px;
    top: 50%;
    transform: translateY(-50%);
  }
`
