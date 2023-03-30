import styled from 'styled-components/macro'
import { Card, cyanColor, darkPurpleColor } from 'styles'

import { MavrykTheme } from '../../../../styles/interfaces'

export const GovernanceTopBarStyled = styled(Card)`
  display: flex;
  align-items: center;
  border-radius: 10px;

  width: 100%;
  height: 75px;

  margin: 30px auto 20px;
  padding: 10px 20px 10px 40px;

  > svg {
    width: 24px;
    height: 24px;
    margin: 0 40px;
    fill: ${({ theme }) => theme.textColor};
  }
`

export const GovTopBarPhaseText = styled.div<{ isCorrectPhase?: boolean; theme: MavrykTheme }>`
  color: ${({ isCorrectPhase, theme }) => (isCorrectPhase ? theme.valueColor : theme.textColor)};
  font-weight: 600;
  font-size: 18px;
`
