import styled from 'styled-components'
import { MavrykTheme } from 'styles/interfaces'

export const TooltipTextStyled = styled.div<{ defaultStrokeColor?: string; theme: MavrykTheme }>`
  font-size: 12px;
  display: block;
  hyphens: auto;
  text-align: center;
  padding: 3px 5px;
  border-radius: 3px;
  line-height: 15px;
  background: ${({ theme }) => theme.tooltipTextBg};
  color: ${({ theme }) => theme.placeholders};
  max-width: 40vw;

  a {
    color: ${({ theme }) => theme.linksAndButtons};
  }
`

export const TooltipTriggerStyled = styled.div<{ theme: MavrykTheme }>`
  transition: opacity 250ms;

  svg {
    width: 12px;
    height: 12px;
    fill: ${({ theme }) => theme.subHeadingText};
  }

  &:hover {
    opacity: 0.8;
  }
`
