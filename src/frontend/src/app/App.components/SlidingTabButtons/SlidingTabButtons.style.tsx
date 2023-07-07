import styled, { css } from 'styled-components/macro'
import { BUTTON_RADIUS } from '../../../styles/constants'
import { MavrykTheme } from '../../../styles/interfaces'

export const SlidingTabButtonsStyled = styled.div<{ theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.backgroundColor};
  border: 1px solid ${({ theme }) => theme.strokeColor};
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  border-radius: 20px;
  height: 40px;
  padding: 1px;

  &.disabled {
    opacity: 0.6;
    cursor: not-allowed;

    > button {
      cursor: not-allowed;
    }
  }

  &.vault {
    height: 40px;
    width: 310px;

    button {
      white-space: nowrap;
    }
  }
`

export const ButtonStyled = styled.button<{ disabled: boolean; theme: MavrykTheme }>`
  border: none;
  cursor: pointer;
  height: 100%;
  width: -webkit-fill-available;
  white-space: nowrap;
  padding: 0 22px;
  border-radius: ${BUTTON_RADIUS};
  user-select: none;
  color: ${({ theme }) => theme.regularText};
  background: transparent;

  &.selected {
    color: ${({ theme }) => theme.backgroundColor};
    background: ${({ theme }) => theme.forTabs};
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
`
