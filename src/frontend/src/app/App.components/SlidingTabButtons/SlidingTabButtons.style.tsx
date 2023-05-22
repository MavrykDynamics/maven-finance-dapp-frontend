import styled, { css } from 'styled-components/macro'
import { turn } from 'styles/animations'
import { darkColor } from '../../../styles'
import { BUTTON_RADIUS } from '../../../styles/constants'
import { MavrykTheme } from '../../../styles/interfaces'
import { PRIMARY, SECONDARY, TRANSPARENT } from './SlidingTabButtons.constants'

export const SlidingTabButtonsStyled = styled.div<{ theme: MavrykTheme }>`
  background-color: ${darkColor};
  border: 1px solid ${({ theme }) => theme.lPurple_dPurple_lPuprple};
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  border-radius: 20px;

  > * {
    &:first-child {
      margin-left: 1px;
    }
    &:last-child {
      margin-right: 1px;
    }
  }

  &.disabled {
    opacity: 0.7;
    cursor: not-allowed;

    > button {
      cursor: not-allowed;
    }
  }

  &.transaction-history {
    button {
      white-space: nowrap;
      margin: 0;
    }
  }
`

export const ButtonStyled = styled.button<{ disabled: boolean; theme: MavrykTheme }>`
  border: none;
  cursor: pointer;
  height: 36px;
  width: -webkit-fill-available;
  white-space: nowrap;
  padding: 0 22px;
  border-radius: ${BUTTON_RADIUS};
  user-select: none;
  color: ${({ theme }) => theme.textColor};
  background: transparent;

  &.selected {
    color: ${({ theme }) => theme.containerColor};
    background: linear-gradient(90deg, #86d4c9 0.31%, #8d86eb 99.97%);
  }

  &.loading {
    pointer-events: none;
    opacity: 0.8;
  }

  ${({ disabled }) =>
    disabled
      ? css`
          opacity: 0.7;
          cursor: not-allowed;
        `
      : ''}
`

export const ButtonText = styled.div<{ theme: MavrykTheme }>`
  > div {
    text-align: center;
    margin: auto;
    display: inline-block;
    vertical-align: top;

    font-weight: 600;
    font-size: 14px;
    line-height: 21px;
  }
  &.${PRIMARY} {
    color: ${({ theme }) => theme.textColor};
  }

  &.${SECONDARY} {
    color: ${({ theme }) => theme.primaryColor};
  }

  &.${TRANSPARENT} {
    color: ${({ theme }) => theme.primaryColor};
  }
`

export const ButtonLoadingIcon = styled.svg<{ theme: MavrykTheme }>`
  width: 16px;
  height: 16px;
  margin-top: 4px;
  margin-right: 15px;
  vertical-align: sub;
  stroke: ${({ theme }) => theme.textColor};
  stroke-width: 1px;
  stroke-dashoffset: 94.248;
  stroke-dasharray: 47.124;
  animation: ${turn} 1.6s linear infinite forwards;

  &.${PRIMARY} {
    stroke: ${({ theme }) => theme.containerColor};
  }

  &.${SECONDARY} {
    stroke: ${({ theme }) => theme.primaryColor};
  }

  &.${TRANSPARENT} {
    stroke: ${({ theme }) => theme.textColor};
  }
`
