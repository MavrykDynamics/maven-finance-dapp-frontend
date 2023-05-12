import styled, { css } from 'styled-components/macro'
import { darkPurpleColor } from 'styles'
import { MavrykTheme } from 'styles/interfaces'

export const TimeLeftAreaWrap = styled.div<{ showBorder: boolean }>`
  position: relative;
  padding-left: 15px;

  ${({ showBorder }) =>
    showBorder
      ? css`
          &::before {
            content: '';
            width: 2px;
            height: 38px;
            top: 50%;
            transform: translateY(-50%);
            left: -15px;
            position: absolute;
            background-color: ${darkPurpleColor};
          }
        `
      : ''}

  > div {
    font-size: 18px;
  }
`

export const MoveNextRoundModalBase = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  flex-direction: column;
  row-gap: 20px;

  .descr {
    font-weight: 600;
    font-size: 18px;
    line-height: 27px;
    text-align: center;
    padding: 0 30px;
    color: ${({ theme }) => theme.textColor};
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
        font-weight: 500;
        font-size: 14px;
        color: ${({ theme }) => theme.dataColor};
      }

      .value {
        font-weight: 600;
        font-size: 16px;
        color: ${({ theme }) => theme.valueColor};
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
export const SmallTimerWrapper = styled.div<{ theme: MavrykTheme }>`
  display: inline-block;
  ul > li {
    font-size: 14px;
    width: 22px;
  }
`
