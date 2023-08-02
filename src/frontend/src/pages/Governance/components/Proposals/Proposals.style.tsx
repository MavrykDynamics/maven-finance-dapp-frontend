import styled, { css } from 'styled-components/macro'
import { CardHover, boxShadowColor, cyanColor, royalPurpleColor, skyColor } from 'styles'

import { MavrykTheme } from '../../../../styles/interfaces'

export const ProposalListContainer = styled.div<{ theme: MavrykTheme }>`
  margin-bottom: 38px;
  position: relative;

  .proposals-list-wrapper {
    margin-top: 15px;
    display: flex;
    flex-direction: column;
    row-gap: 10px;
  }

  &.history {
    h2 {
      margin-bottom: 65px;
    }
  }
`

export const ProposalListItem = styled(CardHover)<{ selected: boolean; theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.containerColor};
  border: 1px solid ${royalPurpleColor};
  height: 57px;
  margin: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px;
  border-radius: 10px;
  font-weight: 600;
  padding: 8px 28px;
  cursor: pointer;

  ${({ selected }) =>
    selected &&
    css`
      border-color: ${cyanColor};
      box-shadow: 0px 4px 4px ${boxShadowColor};
    `}

  .proposal-voted-mvk {
    font-weight: 600;
    font-size: 14px;
    color: ${skyColor};
    margin-right: 10px;
  }
`

export const VoterListItem = styled(CardHover)<{ theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.containerColor};
  border: 1px solid ${royalPurpleColor};
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 10px auto;
  border-radius: 10px;
  font-weight: 600;
  padding: 14px 24px;

  .left {
    display: flex;
    column-gap: 10px;

    .img-wrapper,
    svg {
      width: 45px;
      height: 45px;
      fill: ${({ theme }) => theme.textColor};

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 50%;
      }
    }

    .info {
      display: flex;
      flex-direction: column;
      justify-content: center;
      row-gap: 5px;

      span {
        color: ${({ theme }) => theme.textColor};
      }

      div {
        font-size: 16px;
        color: ${({ theme }) => theme.dataColor};
        align-items: flex-start;

        svg {
          stroke: ${({ theme }) => theme.dataColor};
          stroke-width: 0.5px;
          width: 22px;
          height: 22px;
        }
      }
    }
  }
`

export const ProposalItemLeftSide = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  font-size: 14px;
  align-items: center;
  margin-right: auto;
  color: ${({ theme }) => theme.textColor};

  > span {
    font-weight: 600;
    width: 25px;
  }

  > h4 {
    font-weight: 600;
    padding-right: 8px;

    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`
