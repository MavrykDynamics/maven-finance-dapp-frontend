import styled, { css } from 'styled-components'
import { MavrykTheme } from 'styles/interfaces'

export const GradientDiagramStyled = styled.div<{ theme: MavrykTheme; gradient: string; gradientWidth: number }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  width: 100%;
  height: 4px;
  background: #696969;

  &::before {
    content: '';
    width: ${({ gradientWidth }) => `${gradientWidth}%`};
    background: ${({ gradient }) => gradient};
    height: 100%;
    z-index: 5;
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
  }

  &.loansModals {
    margin: 5px 0;
  }
`

export const GradientBreakpoint = styled.div<{ theme: MavrykTheme; background: string }>`
  height: 8px;
  width: 8px;
  border-radius: 50%;
  z-index: 10;

  ${({ background }) =>
    css`
      background: ${background};
    `}
`
