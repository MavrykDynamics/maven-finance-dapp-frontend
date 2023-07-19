import styled, { css } from 'styled-components'
import { BUTTON_RADIUS } from 'styles/constants'
import { MavrykTheme } from 'styles/interfaces'
import {
  BUTTON_NAVIGATION,
  BUTTON_PRIMARY,
  BUTTON_PULSE,
  BUTTON_ROUND,
  BUTTON_SECONDARY,
  BUTTON_THIRD,
  BUTTON_SIMPLE,
  BUTTON_SIMPLE_SMALL,
  BUTTON_WIDE,
  VOTING_AGAINST,
  VOTING_FOR,
  VOTING_PASS,
  BUTTON_LARGE,
  BUTTON_REGULAR,
  BUTTON_SECONDARY_PURPLE,
  BUTTON_SECONDARY_CYAN,
} from './Button.constants'

const BUTTONS_KIND_STYLES = css`
  &.${BUTTON_PRIMARY} {
    color: ${({ theme }) => theme.cards};
    background-color: ${({ theme }) => theme.linksAndButtons};

    svg {
      fill: ${({ theme }) => theme.cards};
    }
  }

  &.${BUTTON_SECONDARY} {
    color: ${({ theme }) => theme.linksAndButtons};
    background-color: transparent;
    border: 2px solid ${({ theme }) => theme.linksAndButtons};

    svg {
      fill: ${({ theme }) => theme.linksAndButtons};
    }
  }
  &.${BUTTON_SECONDARY_PURPLE} {
    color: ${({ theme }) => theme.regularText};
    background-color: transparent;
    border: 2px solid ${({ theme }) => theme.strokeColor};

    svg {
      fill: ${({ theme }) => theme.strokeColor};
    }
  }
  &.${BUTTON_SECONDARY_CYAN} {
    color: ${({ theme }) => theme.rpcNodeSelecledColor};
    background-color: transparent;
    border: 2px solid ${({ theme }) => theme.rpcNodeSelecledColor};

    svg {
      fill: ${({ theme }) => theme.rpcNodeSelecledColor};
    }
  }
  &.${BUTTON_THIRD} {
    width: fit-content;
    height: fit-content;
    padding: 0;

    background-color: transparent;
    border: 1px solid ${({ theme }) => theme.divider};

    svg {
      fill: ${({ theme }) => theme.linksAndButtons};
    }
  }

  &.${BUTTON_SIMPLE} {
    width: fit-content;
    height: fit-content;
    font-size: 14px;
    padding: 0;

    color: ${({ theme }) => theme.linksAndButtons};

    svg {
      fill: ${({ theme }) => theme.linksAndButtons};
    }
  }

  &.${BUTTON_SIMPLE_SMALL} {
    width: fit-content;
    height: fit-content;
    font-size: 14px;
    padding: 0;

    color: ${({ theme }) => theme.linksAndButtons};

    svg {
      width: 14px;
      height: 14px;
      fill: ${({ theme }) => theme.linksAndButtons};
    }
  }

  &.${BUTTON_NAVIGATION} {
    width: fit-content;
    height: fit-content;
    padding: 0;
    position: relative;
    transition: 0.3s all;
    color: ${({ theme }) => theme.menuButtonText};

    &.selected:not(:disabled),
    &:hover:not(:disabled) {
      &::before {
        position: absolute;
        bottom: -7px;
        left: 50%;
        transform: translateX(-50%);
        transition: 0.3s all;
        content: '';
        width: 30px;
        height: 1px;
        background-color: ${({ theme }) => theme.selectedColor};
      }
      color: ${({ theme }) => theme.selectedColor};
    }
  }

  &.${VOTING_FOR} {
    color: ${({ theme }) => theme.cards};
    background-color: ${({ theme }) => theme.upColor};
  }

  &.${VOTING_PASS} {
    color: ${({ theme }) => theme.cards};
    background-color: ${({ theme }) => theme.neutralColor};
  }

  &.${VOTING_AGAINST} {
    color: ${({ theme }) => theme.cards};
    background-color: ${({ theme }) => theme.downColor};
  }
`

const BUTTONS_FORMS_STYLES = css`
  &.${BUTTON_WIDE} {
    padding: 0;
    width: 100%;
  }

  &.${BUTTON_ROUND} {
    padding: 0;
    border-radius: 50%;

    /* Make button square, this type of button will contain only icon */
    width: 50px;

    &.isThin {
      height: 36px;
      width: 36px;
    }
  }

  &.isSquare {
    border-radius: 10px;
  }
`

const BUTTONS_SIZES_STYLES = css`
  &.${BUTTON_LARGE} {
    padding: 0 35px;
  }

  &.${BUTTON_REGULAR} {
    padding: 0 20px;
  }
`

const BUTTONS_ANIMATIONS_STYLES = css`
  &.${BUTTON_PULSE} {
    animation: pulse 2s infinite;
    box-shadow: 0 0 0 0 rgba(134, 212, 201, 1);
  }
`

// TODO: refactor colors with theme implementation
export const ButtonStyled = styled.button<{ theme: MavrykTheme }>`
  font-weight: 600;
  font-size: 16px;
  line-height: 16px;

  cursor: pointer;
  user-select: none;
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  height: 50px;

  border-radius: ${BUTTON_RADIUS};

  /* styling for buttons sizes */
  ${BUTTONS_SIZES_STYLES}

  /* styling for buttons forms */
  ${BUTTONS_FORMS_STYLES}

  /* styling for main button kinds */
  ${BUTTONS_KIND_STYLES}

  /* additional kinds */
  ${BUTTONS_ANIMATIONS_STYLES}

  .child {
    display: flex;
    align-items: center;
    justify-content: center;
    column-gap: 10px;
  }

  .circle-spinner {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  /* Icon styling */
  svg {
    transition: 0.3s all;
    width: 24px;
    height: 24px;
  }

  &.isThin {
    height: 36px;
    border-width: 1px;

    svg {
      width: 20px;
      height: 20px;
    }
  }

  &:hover {
    opacity: 0.8;
  }

  &.disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &.isLoading {
    .child {
      visibility: hidden;
    }
  }
`
