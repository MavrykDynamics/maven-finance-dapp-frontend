import { Link } from 'react-router-dom'
import styled, { css } from 'styled-components'

import { MavrykTheme } from 'styles/interfaces'
import { LinkWide } from './CustomLink.const'

const navLinkBeforeItem = css`
  &:before {
    position: absolute;
    bottom: -1px;
    left: 50%;
    transform: translateX(-50%);
    transition: 0.3s all;
    content: '';
    width: 30px;
    height: 1px;
    background-color: ${({ theme }) => theme.selectedColor};
  }
`

// get styles for default nav link and active
const getNavLinkStyles = (isActive: boolean) => css`
  position: relative;
  transition: 0.3s all;

  font-weight: 600;
  font-size: 16px;
  line-height: 22px;

  color: ${({ theme }) => (isActive ? theme.selectedColor : theme.navTitleColor)};

  ${isActive
    ? css`
        color: ${({ theme }) => theme.selectedColor};

        ${navLinkBeforeItem}
      `
    : css`
        &:hover {
          ${navLinkBeforeItem}

          color: ${({ theme }) => theme.selectedColor};
        }
      `}
`

// linkFormStyles holds all forms that link can be from LinkKind type
const linkFormStyles = css`
  &.${LinkWide} {
    width: 100%;
    display: block;
  }
`

// linkAppearanceStyles holds all keys from LinkStyling type
const linkAppearanceStyles = css`
  &.isCyan {
    color: ${({ theme }) => theme.valueColor};
  }

  &.underline {
    text-decoration: underline;
  }

  &.useHover {
    &:hover:not(.disabled) {
      opacity: 0.8;
    }
  }

  &.navigationLink {
    ${getNavLinkStyles(false)}
  }

  &.navigationActiveLink {
    ${getNavLinkStyles(true)}
  }
`

export const LinkStyled = styled(Link)<{ theme: MavrykTheme }>`
  display: inline;
  padding: 0;
  margin: 0;
  cursor: pointer;
  text-decoration: none;
  opacity: 1;
  transition: opacity 0.15s ease-in-out-out;
  will-change: opacity;

  color: ${({ theme }) => theme.textColor};

  ${linkAppearanceStyles}
  ${linkFormStyles}

  &.disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }
`
