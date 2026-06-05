import styled, { css } from 'styled-components'
import {CardHover, FontSize, FontWeight} from 'styles'
import { MavenTheme } from '../../../../styles/interfaces'

export const ProposalListContainer = styled.div<{ theme: MavenTheme }>`
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

export const ProposalListItem = styled(CardHover)<{ $selected: boolean; theme: MavenTheme }>`
  height: 57px;
  margin: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px;
  border-radius: 10px;
  font-weight: ${FontWeight.semibold};
  padding: 8px 28px;
  cursor: pointer;

  ${({ $selected }) =>
    $selected &&
    css`
      border-color: ${({ theme }) => theme.linksAndButtons};
      box-shadow: ${({ theme }) => theme.cardHoverColor};
    `}
  .proposal-voted-mvn {
    font-weight: ${FontWeight.semibold};
    font-size: ${FontSize.base};
    color: ${({ theme }) => theme.primaryText};
    margin-right: 10px;
  }
`

export const VoterListItem = styled(CardHover)<{ theme: MavenTheme }>`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 10px auto;
  border-radius: 10px;
  font-weight: ${FontWeight.semibold};
  padding: 14px 24px;

  .left {
    display: flex;
    column-gap: 10px;

    .img-wrapper,
    svg {
      width: 45px;
      height: 45px;
      fill: ${({ theme }) => theme.subHeadingText};

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
        color: ${({ theme }) => theme.subHeadingText};
      }

      div {
        font-size: ${FontSize.md};
        align-items: flex-start;
      }
    }
  }
`

export const ProposalItemLeftSide = styled.div<{ theme: MavenTheme }>`
  display: flex;
  font-size: ${FontSize.base};
  align-items: center;
  margin-right: auto;
  color: ${({ theme }) => theme.textColor};

  > span {
    font-weight: ${FontWeight.semibold};
    width: 25px;
  }

  > h4 {
    font-weight: ${FontWeight.semibold};
    padding-right: 8px;

    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`
