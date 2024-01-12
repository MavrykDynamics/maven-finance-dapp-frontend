import styled from 'styled-components/macro'
import { MavenTheme } from '../../../styles/interfaces'
import { SECONDARY_TZ_ADDRESS_COLOR, PRIMARY_TZ_ADDRESS_COLOR } from './TzAddress.constants'

export const TzAddressContainer = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: opacity 0.4s ease-in-out;

  &.notCopy {
    cursor: default;
  }

  &:not(.notCopy):hover {
    opacity: 0.8;
  }
`
export const TzAddressStyled = styled.div<{ theme: MavenTheme }>`
  &.${PRIMARY_TZ_ADDRESS_COLOR} {
    color: ${({ theme }) => theme.primaryText};
  }

  &.${SECONDARY_TZ_ADDRESS_COLOR} {
    color: ${({ theme }) => theme.linksAndButtons};
  }

  &.bold {
    font-weight: 600;
  }
`

export const TzAddressIcon = styled.svg<{ theme: MavenTheme }>`
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

  &.${PRIMARY_TZ_ADDRESS_COLOR} {
    fill: ${({ theme }) => theme.primaryText};
  }

  &.${SECONDARY_TZ_ADDRESS_COLOR} {
    fill: ${({ theme }) => theme.linksAndButtons};
  }
`
