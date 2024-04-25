import styled from 'styled-components'
import { Card } from 'styles'
import { MavenTheme } from '../../styles/interfaces'

export const SatellitesOverviewStyled = styled.div<{ theme: MavenTheme }>`
  .top-list {
    display: flex;
    width: 100%;
    justify-content: space-between;
    margin: 30px 0 10px 0;

    .see-all {
      font-weight: 500;
      font-size: 14px;
      line-height: 21px;
    }
  }

  .satellitesList {
    display: flex;
    flex-direction: column;
    row-gap: 10px;
  }
`

export const InfoBlockWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
`

export const SatelliteListStyled = styled.div`
  .feed {
    padding: 16px 25px;
  }
`

export const SatelliteSearchFilter = styled(Card)<{ theme: MavenTheme }>`
  display: flex;
  align-items: center;
  padding: 16px 26px;
  margin-top: 0;
  color: ${({ theme }) => theme.regularText};

  input {
    width: 320px;
    height: 40px;
  }
`

export const NotStakinkBannerStyled = styled.div`
  margin-top: 30px;
  max-height: 90px;

  p {
    max-width: 596px;
    margin: 0;
  }

  blockquote {
    margin: 0;
    padding: 19px 40px;
  }

  button {
    width: 250px;
  }

  &.become-satellite {
    p {
      font-weight: 500;
      font-size: 14px;
      line-height: 24px;
      margin: 0;
    }
  }
`
