import styled from 'styled-components'
import { MavrykTheme } from 'styles/interfaces'

export const TooltipTextStyled = styled.div<{ defaultStrokeColor?: string; theme: MavrykTheme }>`
  display: block;
  max-width: 40vw;

  padding: 3px 5px;
  border-radius: 3px;

  font-size: 12px;
  line-height: 15px;
  text-align: center;
  hyphens: auto;

  background: ${({ theme }) => theme.tooltipTextBg};
  color: ${({ theme }) => theme.placeholders};

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
