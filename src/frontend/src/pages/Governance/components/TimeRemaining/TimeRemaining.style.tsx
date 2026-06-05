import styled, { css } from 'styled-components'
import { FontSize, FontWeight } from 'styles/typography'
import { MavenTheme } from 'styles/interfaces'

export const TimeLeftAreaWrap = styled.div<{ $showBorder: boolean }>`
  position: relative;
  padding-left: 15px;

  ${({ $showBorder }) =>
    $showBorder
      ? css`
          &::before {
            content: '';
            width: 2px;
            height: 38px;
            top: 50%;
            transform: translateY(-50%);
            left: -15px;
            position: absolute;
            background-color: ${({ theme }) => theme.divider};
          }
        `
      : ''}

  > div {
    font-size: ${FontSize.lg};
  }
`

export const MoveNextRoundModalBase = styled.div<{ theme: MavenTheme }>`
  display: flex;
  flex-direction: column;
  row-gap: 20px;

  .descr {
    font-weight: ${FontWeight.semibold};
    font-size: ${FontSize.lg};
    line-height: 27px;
    text-align: center;
    padding: 0 30px;
    color: ${({ theme }) => theme.mainHeadingText};
  }

  .calcs {
    padding: 0 100px;
    display: flex;
    flex-direction: column;
    row-gap: 10px;

    .row {
      display: flex;
      justify-content: space-between;
      width: 100%;

      p {
        margin: 0;
      }

      .name {
        font-weight: ${FontWeight.medium};
        font-size: ${FontSize.base};
        color: ${({ theme }) => theme.regularText};
      }

      .value {
        font-weight: ${FontWeight.semibold};
        font-size: ${FontSize.md};
        color: ${({ theme }) => theme.primaryText};
      }
    }
  }

  .buttons {
    display: flex;
    justify-content: space-between;
    column-gap: 10px;
    margin-top: 10px;
  }
`
