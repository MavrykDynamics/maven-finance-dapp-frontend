import styled from 'styled-components'
import { Card } from 'styles'
import { MavenTheme } from '../../styles/interfaces'

export const EmergencyGovernanceCard = styled(Card)<{ theme: MavenTheme }>`
  padding-top: 28px;
  position: relative;

  > div {
    font-weight: 500;
    font-size: 14px;
    line-height: 24px;
    color: ${({ theme }) => theme.regularText};
    margin: 0;
  }

  a {
    color: ${({ theme }) => theme.linksAndButtons};
    margin-top: 10px;
    font-size: 14px;
    text-decoration: none;
    display: block;
  }

  h2 {
    margin-top: 0;
    margin-bottom: 0;
    font-weight: 600;
  }
`

export const CardContentLeftSide = styled.div<{ theme: MavenTheme }>`
  width: 80%;
  align-items: center;
  justify-content: center;

  > div {
    margin-top: 5px;
    -webkit-line-clamp: 6;
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  h2 {
    margin: 0;
  }
`

export const CardContent = styled.div<{ theme: MavenTheme }>`
  display: flex;
  justify-content: center;

  column-gap: 75px;
`

export const CardContentRightSide = styled.div<{ theme: MavenTheme }>`
  width: 20%;
  align-items: center;
  justify-content: flex-end;
  display: flex;

  .connect-wallet {
    align-items: center;
    justify-content: flex-end;
    display: flex;
    margin: 0;
  }

  .initiateEgovProposal-button {
    max-width: 250px;
    width: 100%;
  }
`

export const EmergencyGovernHistory = styled.div<{ theme: MavenTheme }>`
  padding-top: 39px;

  > h1 {
    margin: 0;
    margin-bottom: 10px;
  }
`
