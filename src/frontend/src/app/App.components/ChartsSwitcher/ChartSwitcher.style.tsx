import styled from 'styled-components/macro'
import { ChartSwitcherAlignmentType } from './chartSwitcher.types'

export const ChartsSwitherWrapper = styled.div<{ space: number; align: ChartSwitcherAlignmentType }>`
  position: absolute;
  top: ${({ space }) => `${space}px`};
  ${({ align, space }) => `${align}: ${space}px;`}
`
