import styled from 'styled-components/macro'
import { ChartSwitcherAlignmentType } from './chartSwitcher.types'

export const ChartsSwitcherWrapper = styled.div<{ space: number; align: ChartSwitcherAlignmentType }>`
  position: absolute;
  z-index: 5; /*to be able to click on this panel when mouse came from charts*/
  top: ${({ space }) => `${space}px`};
  ${({ align, space }) => `${align}: ${space}px;`}
`
