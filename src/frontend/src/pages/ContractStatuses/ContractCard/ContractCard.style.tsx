import styled from 'styled-components'
import { MavenTheme } from '../../../styles/interfaces'

export const ContractCardWrapper = styled.div<{ theme: MavenTheme }>`
  width: 48%;
  min-height: 135px;
  height: fit-content;
  border: 1px solid ${({ theme }) => theme.strokeCards};
  border-radius: 10px;
  display: flex;
  flex-direction: column;

  &:hover,
  &.active {
    border: 1px solid ${({ theme }) => theme.linksAndButtons};
    box-shadow: 0px 4px 4px ${({ theme }) => theme.cardHoverColor};
  }
`

export const ContractCardTopSection = styled.div<{ theme: MavenTheme }>`
  padding: 22px 20px 18px 20px;
  background-color: ${({ theme }) => theme.cards};
  display: flex;
  border-radius: 10px;
  flex-direction: column;
  row-gap: 13px;

  .hidden {
    visibility: hidden;
  }

  .top-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 15px;
  }

  .card-title {
    font-weight: 600;
    font-size: 22px;
    line-height: 100%;
    width: 180px;
    height: 60px;
    color: ${({ theme }) => theme.mainHeadingText};
    padding-right: 10px;
    text-transform: capitalize;
  }

  .card-info-item {
    margin-top: 5px;
    justify-content: space-between;
    display: flex;
    color: ${({ theme }) => theme.regularText};
    column-gap: 15px;
    font-weight: 500;
    font-size: 14px;

    > div {
      font-size: 16px;
      font-weight: 600;
      color: ${({ theme }) => theme.primaryText};
    }

    svg {
      stroke: ${({ theme }) => theme.primaryText};
    }
  }
`
