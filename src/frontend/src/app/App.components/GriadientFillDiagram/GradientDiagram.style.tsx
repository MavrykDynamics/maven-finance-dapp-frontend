import styled, { css } from 'styled-components'
import { MavenTheme } from 'styles/interfaces'

export const GradientDiagramStyled = styled.div<{ theme: MavenTheme; gradient: string; gradientWidth: number }>`
  display: flex;
  box-sizing: border-box;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 4;
  width: 100%;
  height: 4px;
  background: ${({ theme }) => theme.gradientDiagramBackgroundColor};
  border-radius: 100px;

  &::before {
    content: '';
    width: 100%;
    background: ${({ gradient }) => gradient};
    height: 100%;
    border-radius: 100px;
    z-index: 5;
    position: absolute;
    top: 0;
    left: 0;
    clip-path: ${({ gradientWidth }) =>
      `polygon(0 0, ${gradientWidth + 1}% 0, ${gradientWidth + 1}% calc(100% + 0.6px), 0 calc(100% + 0.6px))`};
  }

  &.loansModals {
    margin: 5px 0;
  }
`

export const GradientBreakpoint = styled.div<{ theme: MavenTheme; background: string }>`
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
