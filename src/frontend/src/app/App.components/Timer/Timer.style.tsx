import styled, { css } from 'styled-components'
import { FontSize, FontWeight } from 'styles/typography'
import { MavenTheme } from '../../../styles/interfaces'
import { LETTER_VIEW, COLON_VIEW } from './Timer.view'

export const TimerStyled = styled.div<{
  $negativeColor: string
  $defaultColor: string
  $timerType: typeof LETTER_VIEW | typeof COLON_VIEW
}>`
  margin: 0;
  color: ${({ $defaultColor }) => $defaultColor};

  * {
    font-size: ${FontSize.md};
  }

  ul {
    margin: 0;
    padding: 0;
    display: flex;
    align-items: center;
  }

  li {
    display: inline-block;
    list-style-type: none;
    ${({ $timerType }) =>
      $timerType === LETTER_VIEW
        ? css`
            padding-right: 5px;
          `
        : css`
            text-align: center;
            width: 28px;

            &:last-child {
              margin-right: 7px;
            }
          `}

    color: ${({ $defaultColor }) => $defaultColor};

    &.negative {
      color: ${({ $negativeColor }) => $negativeColor};
    }

    &:last-child {
      padding: 0;
      margin: 0;
    }
  }

  li span {
    display: block;
  }
`

export const ShortTimer = styled.div<{ theme: MavenTheme }>`
  font-weight: ${FontWeight.semibold};
  font-size: ${FontSize.md};
  line-height: 25px;
  color: ${({ theme }) => theme.downColor};
`
