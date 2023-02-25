import styled from 'styled-components'
import { BUTTON_RADIUS } from 'styles/constants'
import { MavrykTheme } from 'styles/interfaces'
import {
  ACTION_PRIMARY,
  ACTION_SECONDARY,
  ACTION_SIMPLE,
  NAV_SIMPLE,
  TRANSPARENT_WITH_BORDER,
} from './Button.constants'

export const ButtonStyled = styled.button<{ theme: MavrykTheme }>`
  padding: 0 31px;
  height: 50px;
  border: none;
  font-weight: 600;
  font-size: 16px;
  line-height: 16px;
  cursor: pointer;
  border-radius: ${BUTTON_RADIUS};
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  column-gap: 10px;

  svg {
    width: 24px;
    height: 24px;
  }

  &:hover {
    opacity: 0.8;
  }

  &.disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &.${ACTION_PRIMARY} {
    color: ${({ theme }) => theme.containerColor};
    background-color: ${({ theme }) => theme.actionPrimaryBtnColor};

    svg {
      fill: ${({ theme }) => theme.containerColor};
    }

    &.pulse {
      animation: pulse 2s infinite;
      box-shadow: 0 0 0 0 rgba(134, 212, 201, 1);
    }
  }

  &.${ACTION_SECONDARY} {
    color: ${({ theme }) => theme.actionPrimaryBtnColor};
    background-color: transparent;
    border: 2px solid ${({ theme }) => theme.actionPrimaryBtnColor};

    svg {
      fill: ${({ theme }) => theme.actionPrimaryBtnColor};
    }
  }

  &.${ACTION_SIMPLE} {
    width: fit-content;
    height: fit-content;
    padding: 3px 7px;
    transition: 0.3s all;
    color: ${({ theme }) => theme.valueColor};
    max-width: unset;
  }

  &.${NAV_SIMPLE} {
    width: fit-content;
    height: fit-content;
    padding: 3px 7px;
    position: relative;
    transition: 0.3s all;
    color: ${({ theme }) => theme.navTitleColor};
    max-width: unset;

    &.active,
    &:not(.see-all):hover {
      &:not(.no-before)::before {
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

    &.see-all {
      svg {
        fill: ${({ theme }) => theme.valueColor};
      }
    }
  }

  &.${TRANSPARENT_WITH_BORDER} {
    background: transparent;
    border: 1px solid ${({ theme }) => theme.valueColor};
    color: ${({ theme }) => theme.valueColor};
    display: flex;
    align-items: center;
    justify-content: center;
    width: fit-content;

    svg {
      fill: ${({ theme }) => theme.valueColor};
    }
  }

  &.go-back {
    a {
      display: flex;
      align-items: center;
      justify-content: center;
      column-gap: 10px;
      color: ${({ theme }) => theme.valueColor};
    }

    svg {
      transform: rotate(180deg);
      width: 18px;
      height: 18px;
      stroke: ${({ theme }) => theme.valueColor};
      fill: ${({ theme }) => theme.valueColor};
    }
  }

  &.margin-top-30 {
    margin-top: 30px;
  }
`
