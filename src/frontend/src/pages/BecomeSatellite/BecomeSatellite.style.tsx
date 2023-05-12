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
    color: ${({ theme }) => theme.textColor};
    padding-bottom: 20px;
  }

  .label {
    color: ${({ theme }) => theme.textColor};
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
    color: ${({ theme }) => theme.blockNameTitleColor};

    textarea {
      font-size: 14px;
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
  }

  .buttons-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-left: auto;
    padding-top: 42px;
    column-gap: 20px;
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
  }

  svg {
    stroke: ${({ balanceOk, theme }) => (balanceOk ? theme.upColor : theme.downColor)};
    width: 12px;
    height: 12px;
    margin-right: 8px;
  }
`

export const BecomeSatelliteOracleText = styled.h3<{ theme: MavrykTheme }>`
  font-weight: 500;
  font-size: 14px;
  color: ${({ theme }) => theme.textColor};
  padding-bottom: 15px;
  line-height: 22px;

  a {
    color: ${({ theme }) => theme.valueColor};
    text-decoration: underline;
    cursor: pointer;
  }

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
