import styled from 'styled-components/macro'
import { Card } from 'styles'
import { MavrykTheme } from '../../styles/interfaces'

export const BecomeSatelliteStyled = styled.div<{ theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.containerColor};
`

export const BecomeSatelliteForm = styled(Card)`
  padding-bottom: 45px;
  margin-top: 0;
  padding-top: 28px;

  > h2 {
    margin: 0;
    font-weight: 600;
    font-size: 22px;
    padding-bottom: 20px;
  }

  .label {
    color: ${({ theme }) => theme.mainHeadingText};
    font-weight: 700;
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
      font-size: 14px;
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
      font-size: 14px;
      font-weight: 500;
    }
    label {
      top: -26px;
    }
  }

  .buttons-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-left: auto;
    padding-top: 42px;
    column-gap: 20px;
  }

  .delegated-banner {
    margin-bottom: 20px;
  }

  .input-fee-wrap {
    width: 163px;
  }
`

export const BecomeSatelliteFormBalanceCheck = styled.div<{ balanceOk: boolean; theme: MavrykTheme }>`
  color: ${({ balanceOk, theme }) => (balanceOk ? theme.upColor : theme.downColor)};
  display: flex;
  padding-bottom: 20px;

  p {
    margin: 0;
    font-size: 16px;
  }

  svg {
    stroke: ${({ balanceOk, theme }) => (balanceOk ? theme.upColor : theme.downColor)};
    width: 14px;
    height: 14px;
    margin-right: 8px;
  }
`

export const BecomeSatelliteOracleText = styled.h3<{ theme: MavrykTheme }>`
  font-weight: 500;
  font-size: 14px;
  color: ${({ theme }) => theme.regularText};
  padding-bottom: 15px;
  line-height: 22px;

  span {
    font-size: 16px;
    font-weight: 600;
  }
`
export const BecomeSatelliteRegisterAsOracle = styled.div<{ theme: MavrykTheme }>`
  padding-top: 20px;

  h3 {
    padding: 20px 0 0 0;
  }

  .checkbox {
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

export const UnregisterSatelliteModalBase = styled.div<{ theme: MavrykTheme }>`
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
      font-weight: 600;
      font-size: 14px;
      line-height: 21px;
      color: ${({ theme }) => theme.subHeadingText};
    }

    .value {
      font-weight: 600;
      font-size: 22px;
      line-height: 22px;
      color: ${({ theme }) => theme.primaryText};
    }
  }

  .descr {
    font-weight: 500;
    font-size: 14px;
    line-height: 24px;
  }

  .descr:nth-child(2) {
    margin-bottom: 30px;
  }

  .descr:nth-child(5) {
    margin-top: 30px;
  }

  .descr-big {
    font-weight: 600;
    font-size: 18px;
    line-height: 27px;
  }
`
export const SatelliteDetailsContainer = styled.div<{ theme: MavrykTheme }>`
  .grid-container {
    display: flex;
    align-items: center;
    justify-content: space-between;

    margin: 30px 0;

    .name {
      margin-bottom: 10px;
    }

    .value {
      font-size: 22px;
      font-weight: 600;
    }
  }

  .metrics {
  }
`
