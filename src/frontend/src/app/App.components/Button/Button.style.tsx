import styled, { css } from 'styled-components'
import { clickWave, turn } from 'styles/animations'
import { BUTTON_RADIUS } from '../../../styles/constants'
import { MavenTheme } from '../../../styles/interfaces'

export const ButtonStyled = styled.button<{ theme: MavenTheme }>`
  padding: 0;
  height: 50px;
  border: none;
  font-weight: 600;
  font-size: 16px;
  line-height: 16px;
  cursor: pointer;
  border-radius: ${BUTTON_RADIUS};
  will-change: box-shadow;
  width: 100%;
  user-select: none;

  &:hover {
    opacity: 0.8;
  }

  &.disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &.clicked {
    animation: ${({ theme }) => clickWave(theme.primaryColor)} 1250ms cubic-bezier(0.19, 1, 0.22, 1);
    animation-fill-mode: forwards;
  }

  &.primary:not(.disabled) {
    color: ${({ theme }) => theme.containerColor};
    background-color: ${({ theme }) => theme.primaryColor};
  }

  &.secondary {
    color: ${({ theme }) => theme.primaryColor};
    background-color: ${({ theme }) => theme.containerColor};
    border: 1.5px solid ${({ theme }) => theme.primaryColor};
  }

  &.transparent {
    color: ${({ theme }) => theme.regularText};
    background-color: ${({ theme }) => theme.cards};
  }

  &.loading {
    pointer-events: none;
    opacity: 0.8;
  }

  &.votingFor {
    color: ${({ theme }) => theme.backgroundColor};
    background-color: ${({ theme }) => theme.upColor};
  }
  &.votingAgainst {
    color: ${({ theme }) => theme.backgroundColor};
    background-color: ${({ theme }) => theme.downColor};
  }
  &.votingAbstain {
    color: ${({ theme }) => theme.backgroundColor};
    background-color: ${({ theme }) => theme.headerSkyColor};
  }

  &.move-to-next {
    svg {
      fill: ${({ theme }) => theme.valueColor};
    }
  }

  &.actionSimple {
    width: fit-content;
    height: fit-content;
    font-size: 16px;
    line-height: 22px;
    font-weight: 600;
    padding: 3px 7px;
    position: relative;
    transition: 0.3s all;
    color: ${({ theme }) => theme.menuButtonText};
    max-width: unset;

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
        background-color: ${({ theme }) => theme.selectedColor};
      }
      color: ${({ theme }) => theme.selectedColor};
    }
  }

  &.actionPrimary {
    color: ${({ theme }) => theme.cards};
    background-color: ${({ theme }) => theme.linksAndButtons};

    &.fill {
      svg {
        fill: ${({ theme }) => theme.cards};
        stroke: none;
      }
    }

    &.noStroke {
      svg {
        stroke: none;
      }
    }
  }

  &.actionSecondary {
    color: ${({ theme }) => theme.linksAndButtons};
    background-color: transparent;
    border: 2px solid ${({ theme }) => theme.linksAndButtons};

    &.close {
      svg {
        stroke: ${({ theme }) => theme.downColor};
      }
    }

    &.fill {
      svg {
        stroke: none;
        fill: ${({ theme }) => theme.linksAndButtons};
      }
    }
  }

  &.button-circle {
    width: 50px;
    flex-shrink: 0;

    svg {
      margin-right: 0;
      stroke: none;
    }

    &.actionSecondary svg {
      fill: ${({ theme }) => theme.actionPrimaryBtnColor};
    }
  }

  &.transparentWithBorder {
    background: transparent;
    border: 1px solid ${({ theme }) => theme.linksAndButtons};
    color: ${({ theme }) => theme.linksAndButtons};
    font-weight: 600;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 31px;
    width: fit-content;

    &.margin-top-30 {
      margin-top: 30px;
    }

    &.arrow {
      svg {
        transform: rotate(180deg);
        width: 16px;
      }
    }

    svg {
      stroke: ${({ theme }) => theme.linksAndButtons};
      fill: ${({ theme }) => theme.linksAndButtons};
    }
  }

  &.connect-wallet-details {
    display: flex;
    align-items: center;
    position: relative;
    margin-right: 15px;
    color: ${({ theme }) => theme.valueColor};
    opacity: 0.7;

    &:hover {
      opacity: 1;
    }
  }

  &.theme-btn {
    height: 38px;
    width: 31%;
    border: 1px solid ${({ theme }) => theme.cardBorderColor};
    color: ${({ theme }) => theme.headerColor};
    border-radius: 8px;
    transition: 0.4s all;

    &:hover,
    &.selected {
      border: 1px solid ${({ theme }) => theme.navLinkSubTitleActive};
      color: ${({ theme }) => theme.navLinkSubTitleActive};
    }
  }

  &.change-wallet {
    width: 185px;
  }

  &.dashboard-sectionLink {
    max-width: 220px;
  }

  &.link {
    width: fit-content;
    background-color: transparent;
    color: ${({ theme }) => theme.valueColor};

    svg {
      stroke: ${({ theme }) => theme.valueColor};
      fill: ${({ theme }) => theme.valueColor};
      width: 14px;
      height: 12px;
      stroke-width: 2px;
    }

    &.arrow-down {
      svg {
        transform: rotate(270deg);
      }
    }

    &.arrow-top {
      svg {
        transform: rotate(-270deg);
      }
    }
  }

  &.add-collateral {
    max-width: 180px;
    max-height: 36px;
    margin-left: auto;
  }
`

export const ButtonText = styled.div<{ theme: MavenTheme }>`
  > div {
    text-align: center;
    margin: auto;
    display: inline-block;
    line-height: 24px;
    vertical-align: top;
  }
  &.primary {
    color: ${({ theme }) => theme.textColor};
  }

  &.secondary {
    color: ${({ theme }) => theme.primaryColor};
  }

  &.transparent {
    color: ${({ theme }) => theme.regularText};
  }

  &.votingFor {
    color: ${({ theme }) => theme.backgroundColor};
  }
  &.votingAgainst {
    color: ${({ theme }) => theme.backgroundColor};
  }
  &.votingAbstain {
    color: ${({ theme }) => theme.backgroundColor};
  }
`

export const ButtonIcon = styled.svg<{ theme: MavenTheme; strokeWidth?: number }>`
  width: 24px;
  height: 24px;
  display: inline-block;
  vertical-align: sub;
  margin-right: 11px;

  &.primary {
    stroke: ${({ theme }) => theme.containerColor};
  }

  &.secondary {
    stroke: ${({ theme }) => theme.primaryColor};
  }

  &.transparent {
    stroke: ${({ theme }) => theme.regularText};
  }
  &.glassBroken {
    stroke: ${({ theme }) => theme.downColor};
  }

  &.actionPrimary {
    stroke: ${({ theme }) => theme.containerColor};
  }

  &.actionSecondary {
    stroke: ${({ theme }) => theme.actionPrimaryBtnColor};
  }

  &.after {
    margin-right: 0px;
    margin-left: 11px;
  }

  ${({ strokeWidth }) =>
    strokeWidth
      ? css`
          stroke-width: ${strokeWidth};
        `
      : ''}
`

export const ButtonLoadingIcon = styled.svg<{ theme: MavenTheme }>`
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

  &.primary {
    stroke: ${({ theme }) => theme.containerColor};
  }

  &.secondary {
    stroke: ${({ theme }) => theme.primaryColor};
  }

  &.transparent {
    stroke: ${({ theme }) => theme.regularText};
  }

  &.actionPrimary {
    stroke: ${({ theme }) => theme.containerColor};
  }

  &.actionSecondary {
    stroke: ${({ theme }) => theme.primaryColor};
  }
`
