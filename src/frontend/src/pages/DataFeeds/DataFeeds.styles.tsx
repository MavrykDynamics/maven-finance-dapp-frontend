import styled from 'styled-components/macro'
import { Card, CardHover } from 'styles'
import { MavrykTheme } from 'styles/interfaces'

export const DataFeedsStyled = styled.section`
  .list-wrapper {
    margin-top: 30px;
    display: flex;
    flex-direction: column;
    row-gap: 10px;
  }
`

export const DataFeedsCardStyled = styled(CardHover)<{ theme: MavrykTheme; isExtendedCard?: boolean }>`
  display: grid;
  padding: 16px 30px;
  transition: 0.5s all;
  margin: 0;

  grid-template-columns: ${({ isExtendedCard }) =>
    isExtendedCard ? '1.1fr 0.8fr 1.1fr 1fr 1.25fr' : '0.87fr 0.55fr 0.95fr 1.2fr'};
  column-gap: ${({ isExtendedCard }) => (isExtendedCard ? '50px' : '30px')};
`

export const FeedsOraclesCardStyled = styled(DataFeedsCardStyled)<{ theme: MavrykTheme }>`
  grid-template-columns: 1fr 1fr 1fr 0.8fr 0.65fr 75px;
  column-gap: 30px;
`

export const FeedsListItem = styled.div<{ theme: MavrykTheme }>`
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
      fill: ${({ theme }) => theme.textColor};

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }

  h5 {
    color: ${({ theme }) => theme.textColor};
    font-weight: 600;
    font-size: 14px;
    line-height: 21px;
    margin-top: 0;
    margin-bottom: 6px;
  }

  var {
    font-style: normal;
    color: ${({ theme }) => theme.dataColor};
    font-weight: 600;
    font-size: 16px;
    line-height: 14px;
    display: flex;
    column-gap: 10px;

    div {
      line-height: 100%;
    }

    p {
      margin: 0;
    }
  }

  &.last-item {
    width: 100%;
    margin-left: auto;
  }

  &.vertical-center {
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
      fill: ${({ theme }) => theme.valueColor};
      stroke: ${({ theme }) => theme.valueColor};
    }
  }
`

export const DataFeedsSearchFilter = styled(Card)<{ theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.containerColor};
  display: flex;
  align-items: center;
  padding: 16px 26px;
  margin-top: 30px;

  color: ${({ theme }) => theme.subTextColor};

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
  }

  button {
    max-width: 250px;

    svg {
      fill: transparent;
    }
  }
`
