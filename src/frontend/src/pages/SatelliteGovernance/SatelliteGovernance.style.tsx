import styled from 'styled-components/macro'
import { Card, royalPurpleColor, containerColor, skyColor, cyanColor, headerColor } from 'styles'
import { MavrykTheme } from 'styles/interfaces'

export const SatelliteGovernanceStyled = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  flex-direction: column;
  row-gap: 30px;
`

export const SatelliteGovernanceStats = styled.div<{ theme: MavrykTheme }>`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  column-gap: 20px;
`

export const SatelliteGovernanceStatsInfo = styled.div<{ theme: MavrykTheme }>`
  padding: 30px 25px;
  height: 102px;

  background-color: ${({ theme }) => theme.containerColor};
  border: 1px solid ${({ theme }) => theme.cardBorderColor};
  border-radius: 10px;

  h3 {
    font-weight: 600;
    font-size: 14px;
    line-height: 21px;

    color: ${({ theme }) => theme.textColor};
  }

  .value {
    display: flex;

    font-weight: 600;
    font-size: 16px;
    line-height: 22px;

    color: ${({ theme }) => theme.dataColor};

    p {
      margin: 0;
    }
  }
`

export const SatelliteGovernanceAvailableActions = styled(Card)`
  margin: 0;
  padding: 0;

  .navigation {
    display: grid;
    grid-template-columns: auto 440px;
    align-items: center;
    padding: 17px 30px;
  }
`

export const SatelliteGovernanceAvailableAction = styled.div<{ theme: MavrykTheme }>`
  border-top: 1px solid ${royalPurpleColor};

  .satellite-address {
    margin-bottom: 19px;
  }

  .inputs-block {
    padding-top: 40px;
    padding-left: 26px;
    padding-right: 26px;
    padding-bottom: 23px;
    position: relative;

    a {
      position: absolute;
      right: 10px;
      top: 10px;
      width: fit-content;
      svg {
        fill: ${cyanColor};
        width: 16px;
        height: 16px;
      }
    }

    .banSatellite,
    .removeOracles,
    .removeFromAggregator {
      &.fill {
        svg {
          stroke: ${containerColor};
        }
      }
    }

    h1 {
      margin-top: 0;
      margin-bottom: 0;
      margin-left: 10px;
    }

    p {
      font-weight: 600;
      font-size: 14px;
      line-height: 21px;
      color: ${({ theme }) => theme.textColor};
      margin-top: 1px;
      margin-bottom: 17px;
      margin-left: 10px;
    }

    .textarea {
      color: ${({ theme }) => theme.textColor};
    }

    label {
      font-weight: 700;
      font-size: 14px;
      line-height: 21px;
      color: ${({ theme }) => theme.textColor};
      padding-left: 8px;
      padding-left: 10px;
      margin-bottom: 5px;
      display: block;
    }

    fieldset {
      display: grid;
      grid-template-columns: 0.5fr 0.5fr;
      gap: 20px;
    }
  }

  .table-wrap {
    position: relative;
  }
`

export const SatelliteGovernanceMenuCards = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 20px;
`
