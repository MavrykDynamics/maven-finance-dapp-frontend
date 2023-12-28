import styled from 'styled-components/macro'
import { Card } from 'styles'
import { MavenTheme } from '../../../../styles/interfaces'

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
    fill: ${({ theme }) => theme.regularText};
  }

  .action {
    margin-left: auto;
  }
`

export const GovTopBarPhaseText = styled.div<{ isActivePhase?: boolean; theme: MavenTheme }>`
  color: ${({ isActivePhase, theme }) => (isActivePhase ? theme.selectedColor : theme.regularText)};
  font-weight: 600;
  font-size: 18px;
`
