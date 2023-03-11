import styled from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'
import { CYAN, PRIMARY, SECONDARY, TRANSPARENT, BLUE } from './TzAddress.constants'

export const TzAddressContainer = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;

  &.notCopy {
    cursor: default;
  }
`
export const TzAddressStyled = styled.div<{ theme: MavrykTheme }>`
  transition: color 0.4s ease-in-out;
  &.${PRIMARY} {
    color: ${({ theme }) => theme.primaryColor};
  }

  &.${SECONDARY} {
    color: ${({ theme }) => theme.headerColor};
    font-weight: 400;
    font-size: 14px;
    line-height: 21px;
  }

  &.${TRANSPARENT} {
    color: ${({ theme }) => theme.backgroundTextColor};
  }

  &.${BLUE} {
    color: ${({ theme }) => theme.dataColor};
  }

  &.${CYAN} {
    color: ${({ theme }) => theme.navTitleColor};
  }

  &.${BLUE} {
    color: ${({ theme }) => theme.headerSkyColor};
  }

  &.bold {
    font-weight: 600;
  }
`

export const TzAddressIcon = styled.svg<{ theme: MavrykTheme }>`
  // TODO: remove important after clearing all cases of usage for this icon
  width: 13px !important;
  height: 13px !important;
  display: inline-block;
  vertical-align: sub;
  margin-left: 6px;
  transition: stroke 0.4s ease-in-out;

  &.${PRIMARY} {
    stroke: ${({ theme }) => theme.backgroundTextColor};
  }

  &.${SECONDARY} {
    stroke: ${({ theme }) => theme.headerColor};
  }

  &.${TRANSPARENT} {
    stroke: ${({ theme }) => theme.primaryColor};
  }

  &.${BLUE} {
    stroke: ${({ theme }) => theme.dataColor};
  }

  &.${CYAN} {
    stroke: ${({ theme }) => theme.navIconColor};
  }

  &.${BLUE} {
    stroke: ${({ theme }) => theme.headerSkyColor};
  }
`
