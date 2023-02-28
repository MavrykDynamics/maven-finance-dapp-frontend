import styled from 'styled-components'
import { BUTTON_RADIUS } from 'styles/constants'
import { MavrykTheme } from 'styles/interfaces'
import {
  BUTTON_MEDIUM,
  BUTTON_NAVIGATION,
  BUTTON_NORMAL,
  BUTTON_PRIMARY,
  BUTTON_ROUND,
  BUTTON_SECONDARY,
  BUTTON_SIMPLE,
  BUTTON_SMALL,
  VOTING_AGAINST,
  VOTING_FOR,
  VOTING_PASS,
} from './Button.constants'

export const ButtonStyled = styled.button<{ theme: MavrykTheme }>`
  font-weight: 600;
  font-size: 16px;
  line-height: 16px;
  cursor: pointer;
  border-radius: ${BUTTON_RADIUS};
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    opacity: 0.8;
  }

  &.disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* styling for buttons forms */
  &.${BUTTON_NORMAL} {
    column-gap: 10px;
    padding: 0 20px;
  }

  &.${BUTTON_ROUND} {
    padding: 0;
    border-radius: 50%;

    /* Make button square, this type of button will contain only icon */
    &.${BUTTON_MEDIUM} {
      height: 50px;
      width: 50px;
    }

    &.${BUTTON_SMALL} {
      height: 36px;
      width: 36px;
    }
  }

  /* styling for buttons sizing */
  &.${BUTTON_MEDIUM} {
    height: 50px;

    svg {
      height: 24px;
      width: 24px;
    }
  }

  &.${BUTTON_SMALL} {
    height: 36px;

    svg {
      height: 20px;
      width: 20px;
    }
  }

  /* styling for button kinds */
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

  &.${BUTTON_SIMPLE} {
    width: fit-content;
    height: fit-content;
    padding: 0;

    color: ${({ theme }) => theme.valueColor};
    svg {
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

    &.active,
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

  /* styling for voting buttons  */
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

  /* additional classes */
  &.pulse {
    animation: pulse 2s infinite;
    box-shadow: 0 0 0 0 rgba(134, 212, 201, 1);
  }

  /* TODO: remove this class later, make icon via fill not stroke */
  &.expand-btn {
    svg {
      height: 8px;
      width: 14px;
      stroke: ${({ theme }) => theme.navIconColor};
      transition: transform 0.3s ease-in-out;
      fill: none;
      stroke-width: 5px;
    }
  }
`
