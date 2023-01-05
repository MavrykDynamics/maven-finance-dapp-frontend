import styled from 'styled-components'
import { BUTTON_RADIUS } from 'styles/constants'
import { MavrykTheme } from 'styles/interfaces'
import { ACTION_SIMPLE, PRIMARY, SECONDARY, TRANSPARENT_WITH_BORDER } from './Button.constants'

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

  &:hover {
    opacity: 0.8;
  }

  &.disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &.${PRIMARY} {
    color: ${({ theme }) => theme.containerColor};
    background-color: ${({ theme }) => theme.primaryColor};
  }

  &.${SECONDARY} {
    color: ${({ theme }) => theme.primaryColor};
    background-color: ${({ theme }) => theme.containerColor};
    border: 1.5px solid ${({ theme }) => theme.primaryColor};
  }

  &.${ACTION_SIMPLE} {
    width: fit-content;
    height: fit-content;
    padding: 3px 7px;
    position: relative;
    transition: 0.3s all;
    color: ${({ theme }) => theme.navTitleColor};
    max-width: unset;

    &.selecting {
      &.active,
      &:hover {
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
