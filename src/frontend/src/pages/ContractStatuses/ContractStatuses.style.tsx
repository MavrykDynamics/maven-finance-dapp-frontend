import styled from 'styled-components'
import { FontSize, FontWeight } from 'styles/typography'
import { MavenTheme } from '../../styles/interfaces'

export const BGStyled = styled.div<{ theme: MavenTheme }>`
  display: flex;
  width: 100%;
  flex-direction: row;
  font-family: 'Metropolis';
  display: grid;
  column-gap: calc((100% - (31.5% * 3)) / 2);
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 65px auto;
  margin-top: 30px;
`

export const BGTop = styled.div<{ theme: MavenTheme }>`
  display: flex;
  flex-direction: column;
  row-gap: 25px;
  height: fit-content;
  grid-column-start: 3;
  grid-column-end: 4;
`

const BGBlockBaseStyles = styled.div<{ theme: MavenTheme }>`
  background-color: ${({ theme }) => theme.cards};
`

export const BGStatusIndicator = styled(BGBlockBaseStyles)<{ theme: MavenTheme }>`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  row-gap: 10px;
  width: 100%;

  padding-bottom: 20px;
  margin-bottom: 25px;
  border-bottom: 1px solid ${({ theme }) => theme.divider};

  .status-indicator-wrapper {
    width: 100%;
    display: flex;
    justify-content: space-between;
    font-weight: ${FontWeight.semibold};
    font-size: ${FontSize.md};
    line-height: 22px;

    color: ${({ theme }) => theme.mainHeadingText};
  }

  .color-red,
  .color-green {
    font-weight: ${FontWeight.semibold};
    font-size: ${FontSize.md};
    line-height: 22px;
    text-transform: uppercase;
  }

  .color-red {
    color: ${({ theme }) => theme.downColor};
  }

  .color-green {
    color: ${({ theme }) => theme.upColor};
  }
`

export const BGMiddleWrapper = styled.div<{ theme: MavenTheme }>`
  display: flex;
  justify-content: space-between;
  height: 40px;
  grid-column-start: 1;
  grid-column-end: 3;
  grid-row-start: 1;
  grid-row-end: 2;

  .buttons-selector {
    display: flex;
    align-items: center;
    column-gap: 20px;
  }
`

export const BGInfo = styled(BGBlockBaseStyles)<{ theme: MavenTheme }>`
  display: flex;
  height: fit-content;
  flex-direction: column;
  justify-content: center;
  padding: 30px;

  border: 1px solid ${({ theme }) => theme.strokeCards};
  border-radius: 10px;

  font-weight: ${FontWeight.medium};
  font-size: ${FontSize.base};
  line-height: 24px;

  color: ${({ theme }) => theme.regularText};

  p {
    margin: 0;
    font-weight: ${FontWeight.medium};
  }

  a {
    color: ${({ theme }) => theme.linksAndButtons};
    font-weight: ${FontWeight.semibold};
  }

  .line {
    margin: 0 auto;
    width: 44px;
    height: 3px;
    background-color: ${({ theme }) => theme.mainHeadingText};
    border-radius: 10px;
  }
`

export const BGCardsWrapper = styled.div<{ theme: MavenTheme }>`
  display: flex;
  flex-direction: column;
  grid-column-start: 1;
  grid-column-end: 3;
  grid-row-start: 2;

  .cards-list {
    display: flex;
    flex-wrap: wrap;
    column-gap: 4%;
    row-gap: 25px;
  }
`

export const BGWhitelist = styled(BGBlockBaseStyles)<{ theme: MavenTheme }>`
  padding: 25px 0;
  margin-top: 20px;
  border-top: 1px solid ${({ theme }) => theme.divider};
  color: ${({ theme }) => theme.mainHeadingText};
  font-weight: ${FontWeight.semibold};
  font-size: ${FontSize.md};
  line-height: 22px;

  .adress-list {
    margin-top: 10px;

    div {
      color: ${({ theme }) => theme.primaryText};
    }
  }
`

export const BGPrimaryTitle = styled.h1<{ theme: MavenTheme }>`
  margin: 0;

  font-weight: ${FontWeight.bold};
  font-size: 25px;
  line-height: 30px;
`
