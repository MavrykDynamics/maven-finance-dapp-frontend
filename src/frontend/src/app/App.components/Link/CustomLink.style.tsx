import styled from 'styled-components'
import { MavrykTheme } from 'styles/interfaces'
import { LinkCyan, LinkWide } from './CustomLink.const'

export const LinkStyled = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  text-decoration: none;
  opacity: 1;
  transition: opacity 0.15s ease-in-out-out;
  will-change: opacity;

  &.${LinkWide} {
    width: 100%;
    display: block;
  }

  &.${LinkCyan} {
    color: ${({ theme }) => theme.valueColor};
  }

  &.underline {
    text-decoration: underline;
  }

  &.hover {
    &:hover {
      opacity: 0.8;
    }
  }
`
