import styled, { css } from 'styled-components'
import { MavrykTheme } from 'styles/interfaces'
import { LinkWide } from './CustomLink.const'

// get styles for default nav link and active
const getNavLinkStyles = (isActive: boolean) => css`
  position: relative;

  * {
    font-weight: 600;
    font-size: 16px;
    line-height: 22px;
    transition: 0.3s all;
    color: ${({ theme }) => (isActive ? theme.navLinkSubTitleActive : theme.navTitleColor)};
  }

  ${isActive ? '' : css`&:hover { `}
  &:before {
    position: absolute;
    bottom: -1px;
    left: 50%;
    transform: translateX(-50%);
    transition: 0.3s all;
    content: '';
    width: 30px;
    height: 1px;
    background-color: ${({ theme }) => theme.navLinkSubTitleActive};
  }
  ${isActive
    ? ''
    : css`
          * {
              color: ${({ theme }) => theme.navLinkSubTitleActive};
            }
          }
          `}
`

export const LinkStyled = styled.div<{ theme: MavrykTheme }>`
  display: inline;
  text-decoration: none;
  opacity: 1;
  transition: opacity 0.15s ease-in-out-out;
  will-change: opacity;

  * {
    color: ${({ theme }) => theme.textColor};
  }

  &.${LinkWide} {
    width: 100%;
    display: block;
  }

  // keys from styling prop
  &.isCyan {
    * {
      color: ${({ theme }) => theme.valueColor};
    }
  }

  &.underline {
    text-decoration: underline;
  }

  &.hover {
    &:hover {
      opacity: 0.8;
    }
  }

  &.disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &.navigationLink {
    ${getNavLinkStyles(false)}
  }

  &.navigationActiveLink {
    ${getNavLinkStyles(true)}
  }
`
