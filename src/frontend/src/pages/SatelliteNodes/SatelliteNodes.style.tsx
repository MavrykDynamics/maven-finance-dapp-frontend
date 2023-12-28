import styled from 'styled-components'
import { MavenTheme } from 'styles/interfaces'

export const SatelliteNodesStyled = styled.div<{ theme: MavenTheme }>`
  .list {
    margin-top: 30px;

    display: flex;
    flex-direction: column;
    row-gap: 10px;
  }
`
