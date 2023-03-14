import styled from 'styled-components/macro'
import { downColor, upColor } from 'styles'
import { MavrykTheme } from 'styles/interfaces'

export const SatelliteCardBottomRow = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  flex-direction: column;
  padding: 38px 25px;
  justify-content: center;
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  row-gap: 40px;
  border-top: 1px solid ${({ theme }) => theme.cardBorderColor};

  p {
    font-weight: 600;
    font-size: 14px;
    line-height: 18px;
    color: ${({ theme }) => theme.valueColor};
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
  grid-template-columns: 160px 100px;
  row-gap: 7px;
  align-items: center;
  padding-top: 10px;

  p {
    margin: 0;
    text-align: right;
    color: ${({ theme }) => theme.dataColor};

    font-weight: 600;
    font-size: 16px;
    line-height: 22px;
  }

  h5 {
    margin: 0;
    color: ${({ theme }) => theme.textColor};

    font-weight: 600;
    font-size: 14px;
    line-height: 21px;
  }
`

export const SatelliteMetrics = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
`

export const SatelliteVotingInfoWrapper = styled.div`
  width: 100%;

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
    color: ${({ theme }) => theme.valueColor};
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
    line-height: 24px;
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

    &.voting-pass {
      color: ${({ theme }) => theme.headerColor};
    }
  }
`
