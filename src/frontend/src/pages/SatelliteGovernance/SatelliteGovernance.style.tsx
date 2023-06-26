import styled from 'styled-components/macro'
import { Card } from 'styles'
import { MavrykTheme } from 'styles/interfaces'

export const SatelliteGovernanceStyled = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  flex-direction: column;
  row-gap: 30px;
  margin-top: 30px;
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
    grid-template-columns: 195px auto 440px;
    align-items: center;
    padding: 17px 30px;

    span {
      font-weight: 500;
      font-size: 14px;
      line-height: 24px;

      color: ${({ theme }) => theme.textColor};
    }
  }
`

export const SatelliteGovernanceAvailableAction = styled.form<{ theme: MavrykTheme }>`
  position: relative;
  display: flex;
  flex-direction: column;
  row-gap: 30px;
  padding: 30px 20px 40px;

  border-top: 1px solid ${({ theme }) => theme.cardBorderColor};

  a {
    position: absolute;
    right: 10px;
    top: 10px;
    width: fit-content;

    svg {
      fill: ${({ theme }) => theme.valueColor};
      width: 16px;
      height: 16px;
    }
  }

  p {
    margin: 0;

    font-weight: 600;
    font-size: 14px;
    line-height: 21px;

    color: ${({ theme }) => theme.textColor};
  }

  fieldset {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  label {
    margin-bottom: 5px;

    font-weight: 600;
    font-size: 14px;
    line-height: 21px;

    color: ${({ theme }) => theme.textColor};
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
