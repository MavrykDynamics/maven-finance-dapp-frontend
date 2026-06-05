import styled, { css } from 'styled-components'
import {CardHover, FontSize, FontWeight} from 'styles'
import { MavenTheme } from 'styles/interfaces'
import { getCouncilActionsBodiesGridSettings } from './CouncilAction.consts'
import { CouncilsActionsIds } from 'providers/CouncilProvider/helpers/council.types'

export const COUNCIL_COLUMN_STYLES = css`
  .column {
    min-width: 0;

    height: 100%;
    display: flex;
    flex-direction: column;

    .name {
      font-weight: ${FontWeight.semibold};
      font-size: ${FontSize.base};
      line-height: 21px;

      color: ${({ theme }) => theme.subHeadingText};
    }

    .value {
      font-weight: ${FontWeight.semibold};
      font-size: ${FontSize.md};
      line-height: 22px;

      color: ${({ theme }) => theme.primaryText};

      display: flex;
      align-items: center;

      height: 100%;
      width: 100%;

      &.open-readmore {
        font-weight: ${FontWeight.medium};
        font-size: ${FontSize.base};
        line-height: 24px;

        color: ${({ theme }) => theme.linksAndButtons};
        text-decoration: underline;
        cursor: pointer;
      }

      .text {
        /* truncate */
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;

        width: 100%;
      }

      a {
        font-weight: ${FontWeight.medium};
        font-size: ${FontSize.base};
        line-height: 24px;

        color: ${({ theme }) => theme.linksAndButtons};
        text-decoration: underline;
        width: 100%;

        /* truncate */
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }

      p {
        margin: 0;
      }

      .img-wrapper,
      .img-plug {
        height: 35px;
        width: 35px;
        fill: ${({ theme }) => theme.subHeadingText};

        img {
          width: 100%;
          height: 100%;

          object-fit: cover;
          border-radius: 50%;
        }
      }

      &.is-green {
        color: ${({ theme }) => theme.upColor};
      }

      &.is-red {
        color: ${({ theme }) => theme.downColor};
      }
    }
  }
`

const COUNCIL_CARD_BODY_AREA_NAMES = css`
  .drop-btn {
    grid-area: drop-btn;
  }

  .member-address {
    grid-area: member-address;
  }

  .old-member-address {
    grid-area: old-member-address;
  }

  .member-name {
    grid-area: member-name;
  }

  .member-url {
    grid-area: member-url;
  }

  .member-image {
    grid-area: member-image;
  }

  .action-meta {
    grid-area: action-meta;
  }
`

export const CouncilActionStyled = styled(CardHover)<{ theme: MavenTheme }>`
  padding: 0;
  margin-top: 0;

  .header {
    padding: 15px 30px;
    max-height: 75px;
    column-gap: 30px;

    display: grid;
    align-items: center;
    grid-template-columns: 140px 1fr 120px 16px;

    &.my-ongoing {
      grid-template-columns: 140px 1fr auto;
    }

    .open-action {
      display: flex;
      align-items: center;

      svg {
        width: 16px;
        height: 16px;
        fill: ${({ theme }) => theme.linksAndButtons};
      }
    }
  }

  ${COUNCIL_COLUMN_STYLES}
  ${COUNCIL_CARD_BODY_AREA_NAMES}
`

export const CouncilActionBodyStyled = styled.div<{ theme: MavenTheme; cardActionId: CouncilsActionsIds | null }>`
  display: grid;

  align-items: center;

  grid-template-columns: ${({ cardActionId }) => getCouncilActionsBodiesGridSettings(cardActionId).columnsTemplate};
  grid-template-rows: ${({ cardActionId }) => getCouncilActionsBodiesGridSettings(cardActionId).rowsTemplate};
  grid-template-areas: ${({ cardActionId }) => getCouncilActionsBodiesGridSettings(cardActionId).areaTemplate};

  padding: 20px 30px;
  column-gap: 30px;
  row-gap: 20px;
`
