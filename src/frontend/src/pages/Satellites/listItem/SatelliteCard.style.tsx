import styled from 'styled-components/macro'
import { Card } from 'styles'
import { MavrykTheme } from 'styles/interfaces'

export const SatelliteOracleStatusComponent = styled.div`
  & > div {
    padding: 8px 12px;
    text-transform: uppercase;
    line-height: 12px;
    width: auto;
    max-width: 130px;
  }
`

export const SatelliteCard = styled(Card)<{ theme: MavrykTheme }>`
  padding: 0;
  margin: 0;
`

export const SatelliteCardInner = styled.div<{ isExtendedListItem?: boolean }>`
  display: grid;
  grid-template-columns: ${({ isExtendedListItem }) => (isExtendedListItem ? 'auto 220px' : 'auto 180px')};
  column-gap: 20px;
  padding: 20px;

  .grid-container {
    display: grid;
    grid-template-rows: repeat(2, auto);
    grid-template-columns: 202px minmax(87px, 1fr) minmax(121px, 1fr);
    grid-column-gap: 34px;
    grid-row-gap: 20px;
  }

  .grid-item:nth-child(1) {
    display: flex;
    position: relative;
    padding-left: 55px;
  }

  .grid-item-replaceable {
    padding-left: ${({ isExtendedListItem }) => (isExtendedListItem ? '55px' : '0')};
  }
`

export const SatelliteCardButtons = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  row-gap: 10px;
  flex-shrink: 0;
  justify-content: space-around;
`

export const SatelliteCardRow = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  padding: 15px;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  color: ${({ theme }) => theme.mainHeadingText};
  border-top: 1px solid ${({ theme }) => theme.divider};

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
      color: ${({ theme }) => theme.selectedColor};
    }
  }
`

export const SatelliteProfileImageContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 0;
  transform: translate(0, -50%);
  display: flex;
  justify-content: space-around;
  height: 45px;
  width: 45px;
  margin-right: 10px;
`

export const SatelliteProfileInfoWrapper = styled.div`
  display: flex;
`

export const SatelliteProfileImage = styled.div`
  background-image: ${({ src }: { src: string }) => `url(${src})`};
  background-size: cover;
  background-position: center;
  border-radius: 50%;
  width: 100%;
  height: 100%;
`

export const SatelliteTextGroup = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  row-gap: 5px;

  .text-wrapper {
    display: flex;
    align-items: center;
  }

  &.oracle-status {
    row-gap: 2px;
  }

  &.voted {
    margin-left: 70px;
  }
`

export const SatelliteMainText = styled.div<{ theme: MavrykTheme }>`
  color: ${({ theme }) => theme.subHeadingText};
  font-weight: 600;
  font-size: 14px;
  max-width: 138px;
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  * {
    margin: 0;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`

export const SatelliteSubText = styled.div<{ theme: MavrykTheme }>`
  color: ${({ theme }) => theme.primaryText};
  font-weight: 600;
  font-size: 16px;
  white-space: nowrap;

  &.toClick {
    cursor: copy;
  }

  p {
    margin: 0;
    white-space: break-spaces;
  }
`

export const SatelliteProfileDetails = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  margin-left: 7px;
  margin-top: 5px;

  span {
    position: relative;

    &::before {
      position: absolute;
      content: '';
      opacity: 0.5;
      width: 100%;
      height: 1px;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      background-color: ${({ theme }) => theme.linksAndButtons};
    }
  }

  svg {
    margin-right: -5px;
  }
`
