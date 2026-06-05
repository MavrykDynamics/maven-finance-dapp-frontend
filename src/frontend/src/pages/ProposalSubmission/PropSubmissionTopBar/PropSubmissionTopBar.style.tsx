import styled from 'styled-components'
import {Card, FontSize, FontWeight} from 'styles'

import { MavenTheme } from '../../../styles/interfaces'

export const PropSubmissionTopBarStyled = styled(Card)<{ theme: MavenTheme }>`
  display: grid;
  grid-template-columns: auto auto;
  align-items: center;

  width: 100%;
  height: 75px;

  margin-top: 30px;
  margin-bottom: 0px;
  padding: 0 35px;

  font-weight: ${FontWeight.semibold};

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
    color: ${({ theme }) => theme.mainHeadingText};
    font-size: ${FontSize.lg};
  }
`

export const CurrentPhaseContainer = styled.div<{ theme: MavenTheme }>`
  display: flex;
  column-gap: 10px;
  align-items: center;

  .phase {
    font-size: ${FontSize.md};
    color: ${({ theme }) => theme.linksAndButtons};
    text-transform: capitalize;
  }
`
