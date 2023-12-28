import styled, { css } from 'styled-components/macro'
import { MavenTheme } from '../../../styles/interfaces'

export const TrimStyled = styled.div<{ trim?: boolean, theme: MavenTheme }>`
 ${({ trim }) => trim && css`
    &::after {
      content: '...';
    }
 `}
`
