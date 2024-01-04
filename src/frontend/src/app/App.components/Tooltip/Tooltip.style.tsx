import styled from 'styled-components'
import { MavenTheme } from 'styles/interfaces'

export const TooltipTextStyled = styled.div<{ defaultStrokeColor?: string; theme: MavenTheme }>`
  display: block;
  max-width: 330px;

  padding: 3px 5px;
  border-radius: 3px;

  font-size: 12px;
  font-weight: 600;
  line-height: 15px;
  text-align: center;
  hyphens: auto;

  background: ${({ theme }) => theme.tooltipTextBg};
  color: ${({ theme }) => theme.placeholders};

  a {
    color: ${({ theme }) => theme.linksAndButtons};
  }

  &.voting-tooltip-content {
    display: flex;
  }
`

export const TooltipTriggerStyled = styled.div<{ theme: MavenTheme }>`
  transition: opacity 250ms;
  display: inline-flex;
  align-items: center;
  cursor: pointer;

  svg {
    width: 12px;
    height: 12px;
    fill: ${({ theme }) => theme.subHeadingText};
  }

  &:hover {
    opacity: 0.8;
  }
`
