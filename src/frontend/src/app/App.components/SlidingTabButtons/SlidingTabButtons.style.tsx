import styled from 'styled-components/macro'
import { BUTTON_RADIUS } from '../../../styles/constants'
import { PRIMARY_SLIDING_TAB_BUTTONS, SECONDARY_SLIDING_TAB_BUTTONS } from './SlidingTabButtons.conts'
import { MavrykTheme } from '../../../styles/interfaces'

export const SlidingTabButtonsStyled = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  justify-content: space-between;
  align-items: center;

  &.disabled {
    opacity: 0.6;
    cursor: not-allowed;

    > button {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  &.${PRIMARY_SLIDING_TAB_BUTTONS} {
    padding: 1px;
    height: 40px;

    background-color: ${({ theme }) => theme.backgroundColor};
    border: 1px solid ${({ theme }) => theme.strokeColor};
    border-radius: 20px;

    &.vault {
      height: 40px;
      width: 310px;
    }
  }

  &.${SECONDARY_SLIDING_TAB_BUTTONS} {
    column-gap: 20px;
    width: fit-content;
  }
`

export const ButtonStyled = styled.button<{ theme: MavrykTheme }>`
  border: none;
  cursor: pointer;
  white-space: nowrap;

  font-weight: 600;
  line-height: 21px;

  &.disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &.${PRIMARY_SLIDING_TAB_BUTTONS} {
    padding: 0 22px;

    height: 100%;
    width: -webkit-fill-available;

    font-size: 14px;
    text-align: center;

    border-radius: ${BUTTON_RADIUS};
    color: ${({ theme }) => theme.regularText};

    &.selected {
      color: ${({ theme }) => theme.backgroundColor};
      background: ${({ theme }) => theme.forTabs};
    }
  }

  &.${SECONDARY_SLIDING_TAB_BUTTONS} {
    position: relative;
    padding-bottom: 6px;

    font-size: 16px;
    color: ${({ theme }) => theme.menuButtonText};

    &.selected {
      color: ${({ theme }) => theme.selectedColor};

      &::after {
        position: absolute;
        left: calc(50% - 15px);
        bottom: 0;

        width: 30px;
        height: 1px;

        content: '';
        background-color: ${({ theme }) => theme.selectedColor};
      }
    }
  }
`
