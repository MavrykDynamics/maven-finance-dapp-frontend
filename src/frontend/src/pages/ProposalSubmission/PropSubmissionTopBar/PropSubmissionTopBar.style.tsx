import styled from 'styled-components/macro'
import { Card, cyanColor, headerColor, skyColor, darkPurpleColor } from 'styles'

import { MavrykTheme } from '../../../styles/interfaces'

export const PropSubmissionTopBarStyled = styled(Card)<{ theme: MavrykTheme }>`
  display: grid;
  grid-template-columns: auto auto;
  align-items: center;

  width: 100%;
  height: 75px;

  margin-top: 30px;
  margin-bottom: 0px;
  padding: 0 35px;

  font-weight: 600;

  > div {
    display: flex;
    align-items: center;
  }

  .right-side {
    justify-content: flex-end;
    column-gap: 45px;
  }

  .left-side {
    column-gap: 15px;
  }

  .title {
    color: ${({ theme }) => theme.textColor};
    font-size: 18px;
  }
`

export const CurrentPhaseContainer = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  column-gap: 10px;
  align-items: center;

  .phase {
    font-size: 16px;
    color: ${cyanColor};
    text-transform: capitalize;
  }
`
