import styled, { css } from 'styled-components'
import { MavrykTheme } from 'styles/interfaces'

export const GradientDiagramStyled = styled.div<{ theme: MavrykTheme; gradient: string; gradientWidth: number }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  width: 100%;
  height: 4px;
  background: ${({ theme }) => theme.gradientDiagramBackgroundColor};
  border-radius: 100px;

  &::before {
    content: '';
    width: 100%;
    background: ${({ gradient }) => gradient};
    height: 100%;
    z-index: 5;
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);

    clip-path: ${({ gradientWidth }) =>
      `polygon(${gradientWidth}% 0, ${gradientWidth}% 50%, ${gradientWidth}% 100%, 0 100%, 0 0)`};
  }

  &.loansModals {
    margin: 5px 0;
  }
`

export const GradientBreakpoint = styled.div<{ theme: MavrykTheme; background: string }>`
  height: 8px;
  width: 8px;
  border-radius: 50%;
  z-index: 6;
  position: relative;

  ${({ background }) =>
    css`
      background: ${background};
    `}

  .text {
    font-weight: 600;
    font-size: 10px;
    line-height: 10px;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: 145%;

    div {
      p {
        white-space: nowrap;
      }
    }
  }
`
