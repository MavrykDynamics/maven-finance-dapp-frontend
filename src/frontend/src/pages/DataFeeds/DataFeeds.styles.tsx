import styled from 'styled-components/macro'
import { Card, CardHover } from 'styles'
import { MavenTheme } from 'styles/interfaces'

export const DataFeedsStyled = styled.section`
  .list-wrapper {
    margin-top: 30px;
    display: flex;
    flex-direction: column;
    row-gap: 10px;
  }
`

export const DataFeedsCardStyled = styled(CardHover)<{ theme: MavenTheme; isExtendedCard?: boolean }>`
  display: grid;
  padding: 16px 30px;
  transition: 0.5s all;
  margin: 0;

  grid-template-columns: ${({ isExtendedCard }) =>
    isExtendedCard ? '1.1fr 0.75fr 1.1fr 0.8fr 1.3fr' : '0.87fr 0.5fr 0.95fr 1.2fr'};
  column-gap: ${({ isExtendedCard }) => (isExtendedCard ? '50px' : '30px')};
`

export const FeedsOraclesCardStyled = styled(DataFeedsCardStyled)<{ theme: MavenTheme }>`
  grid-template-columns: 1fr 1fr 1fr 0.8fr 0.65fr 75px;
  max-height: 80px;
  column-gap: 30px;
  align-items: flex-start;
  padding: 15px 30px 8px 30px;
`

export const FeedsListItem = styled.div<{ theme: MavenTheme }>`
  width: 100%;

  &.with-img {
    padding-left: 45px;
    position: relative;

    .img-wrapper,
    svg {
      display: block;
      position: absolute;
      max-height: 32px;
      max-width: 32px;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      fill: ${({ theme }) => theme.strokeColor};

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }

  h5 {
    color: ${({ theme }) => theme.subHeadingText};
    font-weight: 600;
    font-size: 14px;
    line-height: 21px;
    margin-top: 0;
    margin-bottom: 0px;
  }

  var {
    font-style: normal;
    color: ${({ theme }) => theme.primaryText};
    font-weight: 600;
    font-size: 16px;
    display: flex;
    column-gap: 10px;
    white-space: nowrap;

    div {
      line-height: 100%;
    }

    p {
      margin: 0;
    }
  }

  .converted {
    font-weight: 500;
    font-size: 12px;
    color: ${({ theme }) => theme.primaryText};
    margin-top: -7px;
  }

  &.last-item {
    width: 100%;
    margin-left: auto;
  }

  &.vertical-center {
    height: 75%;
    display: flex;
    align-items: center;
  }

  &.open-full {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    svg {
      width: 16px;
      height: 16px;
      fill: ${({ theme }) => theme.linksAndButtons};
      stroke: ${({ theme }) => theme.linksAndButtons};
    }
  }
`

export const DataFeedsSearchFilter = styled(Card)<{ theme: MavenTheme }>`
  background-color: ${({ theme }) => theme.cards};
  display: flex;
  align-items: center;
  padding: 16px 26px;
  margin-top: 30px;

  input {
    width: 320px;
    height: 40px;
    margin-left: 30px;
    max-width: 375px;
  }

  input {
    margin-left: 30px;
    max-width: 375px;
  }

  .dropDown {
    min-width: 330px;

    h4 {
      color: ${({ theme }) => theme.mainHeadingText};
    }
  }

  button {
    max-width: 250px;
  }
`

export const DataFeedListItemTextTruncated = styled.var<{ theme: MavenTheme }>`
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block !important;
`
