import styled from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'
import { Card } from 'styles'

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;

  .switcher {
    margin-top: 30px;
    width: 287px;
  }
`

export const ChartCard = styled(Card)<{ theme: MavrykTheme }>`
  padding: 30px 20px 15px 20px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`
