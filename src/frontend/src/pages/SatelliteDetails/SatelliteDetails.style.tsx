import styled from 'styled-components'
import { FontSize, FontWeight } from 'styles/typography'
import { MavenTheme } from 'styles/interfaces'

export const SatelliteCardBottomRow = styled.div<{ theme: MavenTheme }>`
  display: flex;
  flex-direction: column;
  padding: 38px 25px;
  justify-content: center;
  font-weight: ${FontWeight.regular};
  font-size: ${FontSize.base};
  line-height: 21px;
  row-gap: 40px;
  border-top: 1px solid ${({ theme }) => theme.divider};

  p {
    font-weight: ${FontWeight.semibold};
    font-size: ${FontSize.base};
    line-height: 18px;
  }
`

export const BlockName = styled.div<{ theme: MavenTheme }>`
  font-weight: ${FontWeight.semibold};
  font-size: ${FontSize.lg};
  margin-bottom: 20px;

  color: ${({ theme }) => theme.mainHeadingText};
`

export const SatelliteMetricsBlock = styled.div<{ theme: MavenTheme }>`
  display: grid;
  grid-template-columns: 160px 100px;
  row-gap: 7px;
  align-items: center;
  padding-top: 10px;

  p {
    margin: 0;
    text-align: right;
    color: ${({ theme }) => theme.primaryText};

    font-weight: ${FontWeight.semibold};
    font-size: ${FontSize.md};
    line-height: 22px;
  }

  h5 {
    margin: 0;
    color: ${({ theme }) => theme.subHeadingText};

    font-weight: ${FontWeight.semibold};
    font-size: ${FontSize.base};
    line-height: 21px;
  }
`

export const SatelliteMetrics = styled.div<{ theme: MavenTheme }>`
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

  .loader {
    margin: 0 auto;
    width: fit-content;
  }
`

export const SatelliteDescrBlock = styled.div<{ theme: MavenTheme }>`
  margin-bottom: 25px;

  p {
    padding-top: 8px;
    margin-bottom: 25px;
    color: ${({ theme }) => theme.regularText};
  }

  .satellite-website {
    color: ${({ theme }) => theme.linksAndButtons};
    font-weight: ${FontWeight.bold};
    font-size: ${FontSize.base};
    line-height: 14px;
  }

  .satellite-website[aria-disabled='true'] {
    color: ${({ theme }) => theme.warningColor};

    span {
      color: ${({ theme }) => theme.buttonDisabled};
    }
  }
`
