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
} from './Button.constants'

const BUTTONS_KIND_STYLES = css`
  &.${BUTTON_PRIMARY} {
    color: ${({ theme }) => theme.containerColor};
    background-color: ${({ theme }) => theme.valueColor};

    svg {
      fill: ${({ theme }) => theme.containerColor};
    }
  }

  &.${BUTTON_SECONDARY} {
    color: ${({ theme }) => theme.valueColor};
    background-color: transparent;
    border: 2px solid ${({ theme }) => theme.valueColor};

    svg {
      fill: ${({ theme }) => theme.valueColor};
    }
  }

  &.${BUTTON_THIRD} {
    width: fit-content;
    height: fit-content;
    padding: 0;

    border: 1px solid ${({ theme }) => theme.cardBorderColor};

    svg {
      fill: ${({ theme }) => theme.valueColor};
    }
  }

  &.${BUTTON_SIMPLE} {
    width: fit-content;
    height: fit-content;
    padding: 0;

    color: ${({ theme }) => theme.valueColor};
    svg {
      fill: ${({ theme }) => theme.valueColor};
    }
  }

  &.${BUTTON_SIMPLE_SMALL} {
    width: fit-content;
    height: fit-content;
    padding: 0;

    color: ${({ theme }) => theme.valueColor};
    svg {
      width: 14px;
      height: 14px;
      fill: ${({ theme }) => theme.valueColor};
    }
  }

  &.${BUTTON_NAVIGATION} {
    width: fit-content;
    height: fit-content;
    padding: 3px 7px;
    position: relative;
    transition: 0.3s all;
    color: ${({ theme }) => theme.navTitleColor};

    &.selected,
    &:hover {
      &::before {
        position: absolute;
        bottom: -3px;
        left: 50%;
        transform: translateX(-50%);
        transition: 0.3s all;
        content: '';
        width: 30px;
        height: 1px;
        background-color: ${({ theme }) => theme.navLinkSubTitleActive};
      }
      color: ${({ theme }) => theme.navLinkSubTitleActive};
    }
  }

  &.${VOTING_FOR} {
    color: ${({ theme }) => theme.backgroundColor};
    background-color: ${({ theme }) => theme.upColor};
  }

  &.${VOTING_PASS} {
    color: ${({ theme }) => theme.backgroundColor};
    background-color: ${({ theme }) => theme.headerSkyColor};
  }

  &.${VOTING_AGAINST} {
    color: ${({ theme }) => theme.backgroundColor};
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

  display: flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  height: 50px;

  border-radius: ${BUTTON_RADIUS};
  padding: 0 20px;

  .child {
    display: flex;
    align-items: center;
    justify-content: center;
    column-gap: 10px;
  }

  /* Icon styling */
  svg {
    transition: 0.3s all;
    width: 24px;
    height: 24px;
  }

  &.isThin {
    height: 36px;

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
      display: none;
    }
  }

  /* styling for buttons forms */
  ${BUTTONS_FORMS_STYLES}

  /* styling for main button kinds */
  ${BUTTONS_KIND_STYLES}

  /* additional kinds */
  ${BUTTONS_ANIMATIONS_STYLES}
`
