import styled from 'styled-components'
import {Card, FontSize, FontWeight} from 'styles'
import { MavenTheme } from '../../styles/interfaces'

export const BecomeSatelliteStyled = styled.div<{ theme: MavenTheme }>`
  background-color: ${({ theme }) => theme.containerColor};
`

export const BecomeSatelliteForm = styled(Card)`
  margin-top: 0;
  padding: 30px 30px 40px 30px;

  > h2 {
    margin: 0;
    font-weight: ${FontWeight.semibold};
    font-size: ${FontSize.xl};
    padding-bottom: 20px;
  }

  .label {
    color: ${({ theme }) => theme.mainHeadingText};
    font-weight: ${FontWeight.bold};
  }

  .row {
    display: flex;
    justify-content: space-between;
    width: 100%;
    margin: 22px 0;

    > div {
      width: 48%;
    }
  }

  #textAreaContainer {
    margin: 42px 0;

    textarea {
      font-size: ${FontSize.base};
    }

    label {
      top: -26px;
    }
  }

  #ipfsUploaderContainer {
    margin-top: 42px;
    position: relative;
  }

  #inputStyled {
    input {
      font-size: ${FontSize.base};
      font-weight: ${FontWeight.medium};
    }
    label {
      top: -26px;
    }
  }

  .buttons-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-left: auto;
    padding-top: 40px;
    column-gap: 20px;
  }

  .delegated-banner {
    margin-bottom: 20px;
  }

  .input-fee-wrap {
    width: 163px;
  }
`

export const BecomeSatelliteNavigation = styled.div<{ theme: MavenTheme }>`
  display: flex;
  align-items: center;
  column-gap: 20px;
`

export const BecomeSatelliteFormBalanceCheck = styled.div<{ $balanceOk: boolean; theme: MavenTheme }>`
  color: ${({ $balanceOk, theme }) => ($balanceOk ? theme.upColor : theme.downColor)};
  display: flex;
  padding-bottom: 20px;

  p {
    margin: 0;
    font-size: ${FontSize.md};
  }

  svg {
    stroke: ${({ $balanceOk, theme }) => ($balanceOk ? theme.upColor : theme.downColor)};
    width: 14px;
    height: 14px;
    margin-right: 8px;
  }
`

export const BecomeSatelliteOracleText = styled.h3<{ theme: MavenTheme }>`
  font-weight: ${FontWeight.medium};
  font-size: ${FontSize.base};
  color: ${({ theme }) => theme.regularText};
  padding-bottom: 15px;
  line-height: 22px;

  span {
    font-size: ${FontSize.md};
    font-weight: ${FontWeight.semibold};
  }
`
export const BecomeSatelliteRegisterAsOracle = styled.div<{ theme: MavenTheme }>`
  padding-top: 20px;

  h3 {
    padding: 20px 0 0 0;
  }

  .checkbox-wrapper {
    display: flex;
    align-items: center;
    column-gap: 10px;
    margin-bottom: 20px;
  }

  .inputs {
    display: flex;
    flex-direction: column;
    row-gap: 40px;
    margin-top: 40px;

    .info-tooltip {
      position: relative;
      top: 1px;
      white-space: normal;
    }
  }

  .warning {
    margin-top: 30px;
  }
`

export const UnregisterSatelliteModalBase = styled.div<{ theme: MavenTheme }>`
  .buttons {
    margin-top: 40px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 10px;
  }

  > div {
    color: ${({ theme }) => theme.subHeadingText};
  }

  .icons {
    display: flex;
    align-items: center;
    column-gap: 15px;
    margin: 10px 0;

    svg {
      fill: ${({ theme }) => theme.linksAndButtons};

      &.telegram {
        width: 22px;
        height: 22px;
      }

      &.discord {
        width: 26px;
        height: 20px;
      }
    }
  }

  .card {
    margin-top: 10px;
    display: flex;
    border: 1px solid ${({ theme }) => theme.strokeColor};
    border-radius: 10px;
    padding: 18px 15px;
    column-gap: 80px;

    .col {
      display: flex;
      flex-direction: column;
    }

    .name {
      font-weight: ${FontWeight.semibold};
      font-size: ${FontSize.base};
      line-height: 21px;
      color: ${({ theme }) => theme.subHeadingText};
    }

    .value {
      font-weight: ${FontWeight.semibold};
      font-size: ${FontSize.xl};
      line-height: 22px;
      color: ${({ theme }) => theme.primaryText};
    }
  }

  .descr {
    font-weight: ${FontWeight.medium};
    font-size: ${FontSize.base};
    line-height: 24px;
  }

  .descr:nth-child(2) {
    margin-bottom: 30px;
  }

  .descr:nth-child(5) {
    margin-top: 30px;
  }

  .descr-big {
    font-weight: ${FontWeight.semibold};
    font-size: ${FontSize.lg};
    line-height: 27px;
  }
`

export const SatelliteDetailsContainer = styled.div<{ theme: MavenTheme }>`
  .grid-container {
    display: flex;
    align-items: center;
    justify-content: space-between;

    margin: 15px 0 30px 0;

    .name {
      margin-bottom: 10px;
    }

    .value {
      font-size: ${FontSize.xl};
      font-weight: ${FontWeight.semibold};
    }
  }
`

export const SatelliteUpperTextBlock = styled.div`
  font-size: ${FontSize.base};
  font-weight: ${FontWeight.semibold};

  margin-left: 11px;
  margin-bottom: 8px;
`
