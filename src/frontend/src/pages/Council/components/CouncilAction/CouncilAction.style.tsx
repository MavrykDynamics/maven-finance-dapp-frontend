import styled, { css } from 'styled-components'
import { CardHover } from 'styles'
import { MavrykTheme } from 'styles/interfaces'
import { getCouncilActionsBodiesGridSettings } from './CouncilAction.consts'
import { CouncilsFormsIds } from 'providers/CouncilProvider/helpers/council.types'

export const COUNCIL_COLUMN_STYLES = css`
  .column {
    min-width: 0;

    height: 100%;
    display: flex;
    flex-direction: column;

    p {
      margin: 0;
    }

    .name {
      font-weight: 600;
      font-size: 14px;
      line-height: 21px;

      color: ${({ theme }) => theme.subHeadingText};
    }

    .value {
      font-weight: 600;
      font-size: 16px;
      line-height: 22px;

      color: ${({ theme }) => theme.primaryText};

      /* truncate */
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;

      width: fit-content;

      &.open-purpose {
        font-weight: 500;
        font-size: 14px;
        line-height: 24px;

        color: ${({ theme }) => theme.linksAndButtons};
        text-decoration: underline;
        cursor: pointer;
      }

      a {
        font-weight: 500;
        font-size: 14px;
        line-height: 24px;

        color: ${({ theme }) => theme.linksAndButtons};
        text-decoration: underline;

        /* truncate */
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
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

export const CouncilActionStyled = styled(CardHover)<{ theme: MavrykTheme }>`
  padding: 0;
  margin-top: 0;

  .header {
    padding: 15px 30px;
    max-height: 75px;
    column-gap: 30px;

    display: grid;
    align-items: center;
    grid-template-columns: 25% 1fr 120px 16px;

    &.my-ongoing {
      grid-template-columns: 25% 1.2fr auto;
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

export const CouncilActionBodyStyled = styled.div<{ theme: MavrykTheme; cardActionId: CouncilsFormsIds | null }>`
  display: grid;

  align-items: center;

  grid-template-columns: ${({ cardActionId }) => getCouncilActionsBodiesGridSettings(cardActionId).columnsTemplate};
  grid-template-rows: ${({ cardActionId }) => getCouncilActionsBodiesGridSettings(cardActionId).rowsTemplate};
  grid-template-areas: ${({ cardActionId }) => getCouncilActionsBodiesGridSettings(cardActionId).areaTemplate};

  padding: 20px 30px;
  column-gap: 30px;
  row-gap: 20px;
`
