import styled from 'styled-components'
import {Card, FontSize, FontWeight} from 'styles'
import { MavenTheme } from 'styles/interfaces'

export const SatelliteGovernanceStyled = styled.div<{ theme: MavenTheme }>`
  display: flex;
  flex-direction: column;
  row-gap: 30px;
  margin-top: 30px;
`

export const SatelliteGovernanceStats = styled.div<{ theme: MavenTheme }>`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  column-gap: 20px;
`

export const SatelliteGovernanceStatsInfo = styled.div<{ theme: MavenTheme }>`
  padding: 30px 25px;
  height: 102px;

  background-color: ${({ theme }) => theme.cards};
  border: 1px solid ${({ theme }) => theme.strokeCards};
  border-radius: 10px;

  h3 {
    font-weight: ${FontWeight.semibold};
    font-size: ${FontSize.base};
    line-height: 21px;

    color: ${({ theme }) => theme.subHeadingText};
  }

  .value {
    display: flex;

    font-weight: ${FontWeight.semibold};
    font-size: ${FontSize.md};
    line-height: 22px;

    color: ${({ theme }) => theme.primaryText};

    p {
      margin: 0;
    }
  }

  a {
    display: flex;
    margin-left: 5px;
    margin-top: 4px;
  }

  .tooltip-trigger {
    display: flex;
    height: fit-content;

    svg {
      fill: ${({ theme }) => theme.primaryText};
    }
  }
`

export const SatelliteGovernanceAvailableActions = styled(Card)`
  margin: 0;
  padding: 0;

  .navigation {
    display: grid;
    grid-template-columns: 195px auto 440px;
    align-items: center;
    padding: 17px 30px;

    span {
      font-weight: ${FontWeight.medium};
      font-size: ${FontSize.base};
      line-height: 24px;

      color: ${({ theme }) => theme.regularText};
    }
  }
`

export const SatelliteGovernanceAvailableAction = styled.form<{ theme: MavenTheme }>`
  position: relative;
  display: flex;
  flex-direction: column;
  row-gap: 30px;
  padding: 30px 20px 40px;

  border-top: 1px solid ${({ theme }) => theme.divider};

  p {
    margin: 0;

    font-weight: ${FontWeight.semibold};
    font-size: ${FontSize.base};
    line-height: 21px;

    color: ${({ theme }) => theme.subHeadingText};
  }

  fieldset {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  label {
    margin-bottom: 5px;

    font-weight: ${FontWeight.semibold};
    font-size: ${FontSize.base};
    line-height: 21px;

    color: ${({ theme }) => theme.mainHeadingText};
  }

  h2,
  p,
  label {
    margin-left: 10px;
  }

  .button-wrapper {
    margin-top: 25px;
    margin-left: auto;
    width: 300px;
  }
`

export const SatelliteGovernanceMenuCards = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 20px;
`
