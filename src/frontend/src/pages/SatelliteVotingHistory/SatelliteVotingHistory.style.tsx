import styled from 'styled-components'
import { FontSize, FontWeight } from 'styles/typography'

export const SatelliteVotingHistoryListItem = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  max-height: 28px;

  p {
    color: ${({ theme }) => theme.regularText};
    font-weight: ${FontWeight.medium};
    font-size: ${FontSize.base};
    line-height: 24px;
  }

  p:first-letter {
    text-transform: uppercase;
  }

  .satellite-voting-history-info {
    flex-shrink: 0;
    padding-left: 16px;
    color: ${({ theme }) => theme.regularText};
    font-weight: ${FontWeight.regular};
    font-size: ${FontSize.base};
  }

  b {
    font-weight: ${FontWeight.bold};
    font-size: ${FontSize.base};

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
