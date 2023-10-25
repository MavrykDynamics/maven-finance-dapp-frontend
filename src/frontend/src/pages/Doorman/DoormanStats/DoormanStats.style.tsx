import styled from 'styled-components/macro'
import { Card, CardHeader } from 'styles'

import { MavrykTheme } from '../../../styles/interfaces'

export const DoormanStatsStyled = styled(Card)`
  display: flex;
  flex-direction: column;
  padding: 30px 23px;
  margin-top: 78px;
  position: relative;

  &::after {
    content: '';
    display: block;
    width: 42px;
    height: 3px;
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: ${({ theme }) => theme.mainHeadingText};
    margin-left: auto;
    margin-right: auto;
    margin-top: 16px;
    border-radius: 2px;
  }
`

export const DoormanStatsHeader = styled(CardHeader)<{ theme: MavrykTheme }>`
  text-align: center;
  margin-bottom: 10px;

  font-weight: 600;
  font-size: 18px;

  &::after {
    height: 0;
  }
`

export const DoormanList = styled.aside<{ theme: MavrykTheme }>`
  > div {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    h4 {
      width: max-content;
      color: ${({ theme }) => theme.regularText};
      font-weight: 500;
      font-size: 14px;
      line-height: 24px;
      display: flex;
      align-items: center;

      a {
        margin-left: 5px;
        height: fit-content;
        display: flex;
      }
    }

    var {
      display: block;
      width: max-content;
      overflow: hidden;
      text-overflow: ellipsis;
      font-style: normal;
      font-weight: 600;
      font-size: 16px;
      line-height: 22px;
      text-align: right;
      color: ${({ theme }) => theme.primaryText};

      p {
        margin: 0;
        font-weight: 600;
        font-size: 16px;
        line-height: 22px;
        text-align: right;
        width: 100%;
        font-weight: 600;
        white-space: nowrap;
      }
    }

    .click-address {
      > div {
        justify-content: flex-end;
      }
    }
  }
`
