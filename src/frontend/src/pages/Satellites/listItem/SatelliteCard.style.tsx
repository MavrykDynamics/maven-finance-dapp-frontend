import styled from 'styled-components/macro'
import { Card } from 'styles'
import { MavrykTheme } from 'styles/interfaces'
import { findColorBasedOnStatus, OracleStatusTypes } from '../helpers/Satellites.consts'

export const SatelliteOracleStatusComponent = styled.div<{
  statusType: OracleStatusTypes
  theme: MavrykTheme
}>`
  padding: 8px 12px;
  text-transform: uppercase;
  border: 1px solid ${({ statusType, theme }) => findColorBasedOnStatus(statusType, theme)};
  border-radius: 10px;
  font-weight: 600;
  font-size: 12px;
  line-height: 12px;
  text-align: center;
  max-width: 130px;
  color: ${({ statusType, theme }) => findColorBasedOnStatus(statusType, theme)};
`

export const SatelliteCard = styled(Card)<{ theme: MavrykTheme }>`
  padding: 0;
  margin: 0;
`

export const SatelliteCardTopRow = styled.div<{ isExtendedListItem?: boolean }>`
  margin-top: 8px;
  column-gap: 30px;
  row-gap: 20px;
  display: grid;
  grid-template-columns: ${({ isExtendedListItem }) => (isExtendedListItem ? '121px 142px' : '121px 133px')};
`

export const SatelliteCardInner = styled.div`
  display: flex;
  padding: 25px;
  padding-right: 0;

  .rows-wrapper {
    display: grid;
    grid-template-columns: 190px auto;
    column-gap: 30px;
  }
`

export const SatelliteCardButtons = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  margin-left: 15px;
  width: 180px;
  flex-shrink: 0;
  justify-content: space-around;
`

export const SatelliteCardRow = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  padding: 15px;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
  color: ${({ theme }) => theme.textColor};
  border-top: 1px solid ${({ theme }) => theme.cardBorderColor};

  span {
    font-weight: 600;
    font-size: 16px;

    &.voting-yes {
      color: ${({ theme }) => theme.upColor};
    }

    &.voting-no {
      color: ${({ theme }) => theme.downColor};
    }

    &.voting-pass {
      color: ${({ theme }) => theme.headerSkyColor};
    }
  }
`

export const SatelliteProfileImageContainer = styled.div`
  display: flex;
  justify-content: space-around;
  height: 50px;
  width: 50px;
  margin-right: 10px;
`

export const SatelliteProfileImage = styled.div`
  background-image: ${({ src }: { src: string }) => `url(${src})`};
  background-size: cover;
  background-position: center;
  border-radius: 50%;
  width: 100%;
  height: 100%;
`

export const SideBySideImageAndText = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: auto;
`

export const SatelliteTextGroup = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  row-gap: 5px;

  &.oracle-status {
    row-gap: 2px;
    height: 120%;
  }

  &.voted {
    margin-left: 70px;
  }
`

export const SatelliteMainText = styled.div<{ theme: MavrykTheme }>`
  color: ${({ theme }) => theme.textColor};
  font-weight: 600;
  font-size: 14px;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;

  * {
    margin: 0;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`

export const SatelliteSubText = styled.div<{ theme: MavrykTheme }>`
  color: ${({ theme }) => theme.dataColor};
  font-weight: 600;
  font-size: 16px;
  white-space: nowrap;

  &.toClick {
    cursor: copy;
  }

  p {
    margin: 0;
  }
`

export const SatelliteProfileDetails = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  margin-top: 7px;
  margin-left: 20px;
  button.transparent {
    color: ${({ theme }) => theme.valueColor};
    font-weight: 600;
    font-size: 14px;
    line-height: 14px;

    svg {
      stroke: ${({ theme }) => theme.valueColor};
      margin-right: 0;
    }

    &:hover {
      color: ${({ theme }) => theme.valueColor};

      svg {
        stroke: ${({ theme }) => theme.valueColor};
      }
    }
  }
`
