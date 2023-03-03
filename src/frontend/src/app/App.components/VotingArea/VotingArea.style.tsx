import styled from 'styled-components/macro'
import { MavrykTheme } from 'styles/interfaces'

export const VotingAreaStyled = styled.article<{ theme: MavrykTheme }>`
  display: flex;
  flex-direction: row;
  margin: 20px 0;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  margin-bottom: 48px;
  flex-direction: column;

  .voted-block {
    display: grid;
    grid-template-columns: 1fr 220px;
    justify-content: space-between;
    align-items: center;
    padding-top: 30px;
    width: 100%;
  }

  .voted-label {
    color: ${({ theme }) => theme.valueColor};
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
