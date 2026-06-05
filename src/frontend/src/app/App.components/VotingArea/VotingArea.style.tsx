import styled from 'styled-components'
import { FontSize, FontWeight } from 'styles/typography'
import { MavenTheme } from 'styles/interfaces'

export const VotingAreaStyled = styled.article<{ theme: MavenTheme }>`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  font-weight: ${FontWeight.semibold};
  flex-direction: column;

  .banner-area {
    grid-row: 1 / 2;
    grid-column: 1 / -1;
  }

  .voted-block {
    display: grid;
    grid-row-gap: 30px;
    grid-template-columns: 1fr 220px;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  .voted-label {
    color: ${({ theme }) => theme.primaryText};
    font-weight: ${FontWeight.semibold};
    font-size: ${FontSize.lg};
  }

  .voted-bar {
    width: 100%;
  }
`

export const VotingButtonsContainer = styled.div`
  width: 100%;
  display: flex;
  column-gap: 10px;
  align-items: center;
  padding-top: 26px;
`
