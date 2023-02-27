import styled from 'styled-components/macro'
import { turn } from 'styles/animations'
import { MavrykTheme } from '../../../styles/interfaces'
import { PRIMARY_COMMA_NUMBER, SECONDARY_COMMA_NUMBER, TRANSPARENT_COMMA_NUMBER } from './CommaNumber.constants'

export const LoadingIcon = styled.svg<{ theme: MavrykTheme }>`
  width: 20px;
  height: 20px;
  vertical-align: sub;
  stroke: ${({ theme }) => theme.textColor};
  stroke-width: 2px;
  stroke-dashoffset: 94.248;
  stroke-dasharray: 47.124;
  animation: ${turn} 1.6s linear infinite forwards;

  &.${PRIMARY_COMMA_NUMBER} {
    stroke: ${({ theme }) => theme.containerColor};
  }

  &.${SECONDARY_COMMA_NUMBER} {
    stroke: ${({ theme }) => theme.headerColor};
  }

  &.${TRANSPARENT_COMMA_NUMBER} {
    stroke: ${({ theme }) => theme.textColor};
  }
`
