import styled from 'styled-components'

export const SatelliteVotingHistoryListItem = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  max-height: 28px;

  p {
    color: ${({ theme }) => theme.regularText};
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
    color: ${({ theme }) => theme.regularText};
    font-weight: 400;
    font-size: 14px;
  }

  b {
    font-weight: 700;
    font-size: 14px;

    &.voting-yes {
      color: ${({ theme }) => theme.upColor};
    }

    &.voting-no {
      color: ${({ theme }) => theme.downColor};
    }

    &.voting-pass {
      color: ${({ theme }) => theme.selectedColor};
    }
  }
`
