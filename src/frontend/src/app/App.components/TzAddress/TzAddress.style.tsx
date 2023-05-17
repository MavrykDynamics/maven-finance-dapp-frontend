import styled from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'
import { CYAN, PRIMARY, SECONDARY, TRANSPARENT, BLUE } from './TzAddress.constants'

export const TzAddressContainer = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: opacity 0.4s ease-in-out;

  &.notCopy {
    cursor: default;
  }

  &:not(.notCopy):hover {
    opacity: 0.7;
  }
`
export const TzAddressStyled = styled.div<{ theme: MavrykTheme }>`
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
  transition: fill 0.4s ease-in-out;

  &.largeIcon {
    // TODO: remove important after clearing all cases of usage for this icon
    width: 17px !important;
    height: 17px !important;
    margin-bottom: 2px;
  }

  &.${PRIMARY} {
    fill: ${({ theme }) => theme.backgroundTextColor};
  }

  &.${SECONDARY} {
    fill: ${({ theme }) => theme.headerColor};
  }

  &.${TRANSPARENT} {
    fill: ${({ theme }) => theme.primaryColor};
  }

  &.${BLUE} {
    fill: ${({ theme }) => theme.dataColor};
  }

  &.${CYAN} {
    fill: ${({ theme }) => theme.navIconColor};
  }

  &.${BLUE} {
    fill: ${({ theme }) => theme.headerSkyColor};
  }
`
