import styled from 'styled-components'
import { MavrykTheme } from 'styles/interfaces'

export const SatelliteNodesStyled = styled.div<{ theme: MavrykTheme }>`
  .list {
    margin-top: 30px;

    display: flex;
    flex-direction: column;
    row-gap: 10px;
  }
`
