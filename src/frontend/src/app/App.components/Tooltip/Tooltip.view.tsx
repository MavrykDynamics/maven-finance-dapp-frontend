import styled from 'styled-components'
import { cyanColor } from 'styles'
import { MavrykTheme } from 'styles/interfaces'
import Icon from '../Icon/Icon.view'

export const TooltipStyled = styled.div<{ defaultStrokeColor?: string; theme: MavrykTheme }>`
  margin-left: 4px;
  cursor: pointer;
  position: relative;
  display: inline;
  height: 12px;
  width: 12px;

  > svg {
    width: 12px;
    height: 12px;
    fill: ${({ theme, defaultStrokeColor }) => defaultStrokeColor ?? theme.dataColor};
  }

  .text {
    font-size: 12px;
    position: absolute;
    bottom: 150%;
    left: 50%;
    transform: translateX(-50%);
    display: block;
    hyphens: auto;
    text-align: center;
    padding: 3px 5px;
    border-radius: 3px;
    line-height: 15px;
    background: #503eaa;
    color: ${({ theme }) => theme.textColor};
    opacity: 0;
    transition: 0.3s all;
    visibility: hidden;
    width: max-content;
    max-width: 330px;
    z-index: 1000;
  }

  .text::after {
    content: ' ';
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    z-index: 1000;
    border-color: #503eaa transparent transparent transparent;
  }

  &:hover {
    .text {
      visibility: visible;
      opacity: 1;
    }

    svg {
      fill: ${cyanColor};
    }
  }

  &.voting-tooltip {
    margin: 0;
    width: 100%;
    .text {
      bottom: 200%;
    }
  }
`

export const CustomTooltip = ({
  text,
  defaultStrokeColor,
  className = '',
  iconId,
  children,
}: {
  children?: JSX.Element
  text?: string
  defaultStrokeColor?: string
  className?: string
  iconId?: 'info' | 'question'
}) => (
  <TooltipStyled className={className} defaultStrokeColor={defaultStrokeColor}>
    {iconId ? <Icon id={iconId} /> : null}
    {text && <div className="text">{text}</div>}
    {children}
  </TooltipStyled>
)
