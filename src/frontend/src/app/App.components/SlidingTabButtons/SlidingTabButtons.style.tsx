import styled from 'styled-components'
import { FontSize, FontWeight } from 'styles/typography'
import { BUTTON_RADIUS } from '../../../styles/constants'
import {
  MEDIUM_SLIDING_TAB_BUTTONS,
  PRIMARY_SLIDING_TAB_BUTTONS,
  SECONDARY_SLIDING_TAB_BUTTONS,
  SMALL_SLIDING_TAB_BUTTONS,
} from './SlidingTabButtons.conts'
import { MavenTheme } from '../../../styles/interfaces'

export const SlidingTabButtonsStyled = styled.div<{ theme: MavenTheme }>`
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

    background-color: ${({ theme }) => theme.backgroundColor};
    border: 1px solid ${({ theme }) => theme.strokeColor};
    border-radius: 20px;

    &.${SMALL_SLIDING_TAB_BUTTONS} {
      height: 30px;
    }

    &.${MEDIUM_SLIDING_TAB_BUTTONS} {
      height: 40px;

      &.vault {
        width: 310px;
      }
    }
  }

  &.${SECONDARY_SLIDING_TAB_BUTTONS} {
    // TODO: if need add sizes for secondary kind
    &.${SMALL_SLIDING_TAB_BUTTONS} {
    }

    &.${MEDIUM_SLIDING_TAB_BUTTONS} {
      column-gap: 20px;
      width: fit-content;
    }
  }
`
export const SlidingTabBtn = styled.button<{ theme: MavenTheme }>`
  border: none;
  cursor: pointer;
  white-space: nowrap;

  font-weight: ${FontWeight.semibold};
  line-height: 21px;

  &.disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &.${PRIMARY_SLIDING_TAB_BUTTONS} {
    height: 100%;
    width: -webkit-fill-available;
    text-align: center;

    border-radius: ${BUTTON_RADIUS};
    color: ${({ theme }) => theme.regularText};

    &.${SMALL_SLIDING_TAB_BUTTONS} {
      font-size: ${FontSize.sm};
      padding: 0 14px;
    }

    &.${MEDIUM_SLIDING_TAB_BUTTONS} {
      font-size: ${FontSize.base};
      padding: 0 22px;
    }

    &.selected {
      color: ${({ theme }) => theme.backgroundColor};
      background: ${({ theme }) => theme.forTabs};
    }
  }

  &.${SECONDARY_SLIDING_TAB_BUTTONS} {
    position: relative;

    color: ${({ theme }) => theme.menuButtonText};

    &.${SMALL_SLIDING_TAB_BUTTONS} {
      font-size: ${FontSize.base};
      padding-bottom: 4px;
    }

    &.${MEDIUM_SLIDING_TAB_BUTTONS} {
      padding-bottom: 6px;
      font-size: ${FontSize.md};
    }

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
