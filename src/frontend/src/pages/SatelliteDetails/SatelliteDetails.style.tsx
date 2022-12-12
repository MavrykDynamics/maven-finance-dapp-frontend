import styled from 'styled-components/macro'
import { cyanColor, downColor, skyColor, subTextColor, upColor } from 'styles'
import { MavrykTheme } from 'styles/interfaces'

export const SatelliteDetailsStyled = styled.div<{ theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.containerColor};
`

export const SatelliteDescriptionText = styled.p`
  font-size: 14px;
  color: ${subTextColor};
  font-weight: ${({ fontWeight }: { fontWeight: number }) => `${fontWeight}`};
  margin: 0;
`
export const SatelliteCardBottomRow = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  flex-direction: column;
  padding: 38px 25px;
  justify-content: center;
  font-weight: 400;
  font-size: 12px;
  line-height: 12px;
  row-gap: 40px;
  border-top: 1px solid ${({ theme }) => theme.cardBorderColor};

  p {
    font-weight: 600;
    font-size: 14px;
    line-height: 14px;
    color: ${cyanColor};
  }
`

export const BlockName = styled.div<{ theme: MavrykTheme }>`
  font-weight: 600;
  font-size: 18px;
  margin-bottom: 20px;
  color: ${({ theme }) => theme.textColor};
`

export const SatelliteMetricsBlock = styled.div<{ theme: MavrykTheme }>`
  display: grid;
  grid-template-columns: 200px 60px;
  align-items: center;
  padding-top: 10px;

  p {
    margin: 3px 0;
    text-align: right;
    color: ${({ theme }) => theme.dataColor};
    font-weight: 600;
    font-size: 16px;
  }

  h5 {
    margin: 0;
    font-weight: 500;
    font-size: 14px;
    color: ${({ theme }) => theme.textColor};
  }
`

export const SatelliteVotingInfoWrapper = styled.div`
  width: 100%;

  figure {
    padding: 0;
  }

  .voting-info-list-wrapper {
    max-height: 84px;
    overflow-y: auto;
    padding-right: 10px;
    margin-top: 10px;
  }
`

export const SatelliteDescrBlock = styled.div<{ theme: MavrykTheme }>`
  margin-bottom: 25px;

  p {
    padding-top: 8px;
    margin-bottom: 25px;
    font-size: 15px;
    color: ${({ theme }) => theme.textColor};
  }

  .satellite-website {
    color: ${cyanColor};
    font-weight: 700;
    font-size: 14px;
    line-height: 14px;
  }
`

export const SatelliteVotingHistoryListItem = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  max-height: 28px;

  p {
    color: ${({ theme }) => theme.textColor};
    font-weight: 500;
    font-size: 14px;
  }

  p:first-letter {
    text-transform: uppercase;
  }

  .satellite-voting-history-info {
    flex-shrink: 0;
    padding-left: 16px;
    color: ${({ theme }) => theme.textColor};
    font-weight: 400;
    font-size: 14px;
  }

  b {
    font-weight: 700;
    font-size: 14px;

    &.voting-yes {
      color: ${upColor};
    }

    &.voting-no {
      color: ${downColor};
    }

    &.voting-abstain {
      color: ${({ theme }) => theme.headerColor};
    }
  }
`
