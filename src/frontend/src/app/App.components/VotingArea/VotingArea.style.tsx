import styled from 'styled-components/macro'
import { MavrykTheme } from 'styles/interfaces'

export const VotingAreaStyled = styled.article<{ theme: MavrykTheme }>`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
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
    color: ${({ theme }) => theme.dataColor};
    font-weight: 600;
    font-size: 18px;
  }
`

export const VotingButtonsContainer = styled.div`
  width: 100%;
  display: flex;
  column-gap: 10px;
  align-items: center;
  padding-top: 26px;
`
