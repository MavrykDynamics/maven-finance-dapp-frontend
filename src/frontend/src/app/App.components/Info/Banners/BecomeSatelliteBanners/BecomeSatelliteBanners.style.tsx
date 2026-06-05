import styled from 'styled-components'
import { FontWeight } from 'styles/typography'
import { MavenTheme } from 'styles/interfaces'

export const NotStakingBannerStyled = styled.div<{ theme: MavenTheme }>`
  margin-top: 30px;
  max-height: 90px;

  // TODO: deal with this hasChild class here, mb add prop to info component
  .hasChild > p {
    max-width: 650px;
    width: 100%;
    display: flex;
    margin: 0;
  }

  .link-btn {
    width: 250px;
  }

  .value > * {
    color: ${({ theme }) => theme.primaryText};
    font-weight: ${FontWeight.semibold};
    display: inline;
  }
`
