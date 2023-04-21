import styled, { css } from 'styled-components/macro'
import { Card, CardHover } from 'styles'
import { MavrykTheme } from '../../styles/interfaces'

export const FinancialRequestsStyled = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  margin-top: 30px;

  .list-container {
    width: 50%;
    max-width: 540px;

    .list {
      margin-bottom: 37px;
    }
  }
`

export const FinancialRequestsRightContainer = styled(Card)<{ theme: MavrykTheme }>`
  width: calc(50% - 25px);
  padding: 28px 30px;
  border-radius: 10px;
  height: min-content;
  margin-top: 0;
  flex-shrink: 0;
  margin-left: 30px;
  position: relative;
  padding-bottom: 86px;

  &::after {
    position: absolute;
    content: '';
    width: 44px;
    height: 3px;
    border-radius: 10px;
    bottom: 42px;
    left: 50%;
    background-color: ${({ theme }) => theme.cardBorderColor};
    transform: translateX(-50%);
  }

  .voting_ending {
    margin-top: 10px;
    font-weight: 600;
    font-size: 14px;
    color: ${({ theme }) => theme.dataColor};
  }

  .fr-voting {
    margin-bottom: 20px;
    > div {
      justify-content: space-between;
      column-gap: 15px;
      padding-top: 0px;
      button {
        width: 50%;
      }
    }
  }

  hr {
    border: none;
    height: 1px;
    background-color: ${({ theme }) => theme.cardBorderColor};
    margin-bottom: 10px;
  }

  .info_section_wrapper {
    display: flex;
    column-gap: 50px;
  }

  .info_section {
    display: flex;
    flex-direction: column;
    margin-top: 30px;

    .list {
      display: flex;
      flex-direction: column;
      margin-top: 6px;
      width: 100%;

      .list_item {
        display: flex;
        width: 100%;
        justify-content: space-between;
        p {
          margin: 0;
        }
      }
    }
  }
`

export const InfoBlockTitle = styled.div<{ theme: MavrykTheme }>`
  font-weight: 600;
  font-size: 18px;
  line-height: 18px;
  color: ${({ theme }) => theme.textColor};
`

export const InfoBlockName = styled.div<{ theme: MavrykTheme }>`
  font-weight: 500;
  font-size: 14px;
  line-height: 24px;
  margin-top: 5px;
  color: ${({ theme }) => theme.textColor};
`

export const InfoBlockValue = styled(InfoBlockName)`
  font-weight: 600;
  font-size: 16px;
  color: ${({ theme }) => theme.dataColor};

  svg {
    width: 22px;
    height: 22px;
    stroke: ${({ theme }) => theme.dataColor};
  }
`

export const FRListItem = styled(CardHover)<{ selected: boolean; theme: MavrykTheme }>`
  min-height: 57px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 10px auto;
  padding: 0 18px;
  border-radius: 10px;
  font-weight: 600;
  padding: 8px 28px;
  cursor: pointer;

  ${({ selected }) =>
    selected &&
    css`
      border-color: ${({ theme }) => theme.textColorHovered};
      box-shadow: 0px 4px 4px ${({ theme }) => theme.boxShadowColor};
    `}

  .proposal-voted-mvk {
    font-weight: 600;
    font-size: 14px;
    color: ${({ theme }) => theme.dataColor};
    margin-right: 10px;
    white-space: nowrap;
  }

  .id-and-title {
    display: flex;
    font-size: 14px;
    align-items: center;
    margin-right: auto;

    > span {
      font-weight: 500;
      margin-right: 20px;
      color: ${({ theme }) => theme.textColor};
    }

    > h4 {
      font-weight: 500;
      color: ${({ theme }) => theme.textColor};
      padding-right: 8px;
      max-width: 220px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
`
