import { CouncilsFormsIds } from 'providers/CouncilProvider/helpers/council.types'
import styled, { css } from 'styled-components'
import { Card } from 'styles'
import { MavrykTheme } from 'styles/interfaces'
import { CouncilActionsToSignGridMapper } from './CouncilActionsToSign.consts'
import { COUNCIL_COLUMN_STYLES } from '../CouncilAction/CouncilAction.style'

export const CouncilActionsToSignStyled = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  justify-content: space-between;

  width: 100%;

  /* carousel width */
  > div {
    width: 100%;
  }

  counter-reset: cardIndex;
`

export const CouncilActionToSignStyled = styled(Card)`
  position: relative;

  height: 200px;
  min-width: 247px;
  max-width: 100%;

  flex: 0 0 100%;
  flex-basis: fit-content;

  &.small {
    flex: 0 0 100%;
  }

  &.medium {
    flex: 0 0 100%;
  }

  &.large {
    flex: 0 0 100%;
  }

  margin: 0;
  padding: 25px;

  &:not(.isLast) {
    margin-right: 20px;
  }

  &::before {
    counter-increment: cardIndex 1;
    content: counter(cardIndex);
    position: absolute;
    right: 12px;
    top: 10px;

    font-weight: 700;
    font-size: 14px;
    line-height: 21px;

    color: ${({ theme }) => theme.strokeColor};
  }
`

const ACTION_TO_SIGN_AREAS_NAMES = css`
  /* ------- common */
  .admin-address {
    grid-area: admin-address;
  }

  /* ------- members */
  .old-member-address {
    grid-area: old-member-address;
  }

  .member-address {
    grid-area: member-address;
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

  /* ------- vesting */
  .vestee-address {
    grid-area: vestee-address;
  }

  .vestee-allocated-amount {
    grid-area: vestee-allocated-amount;
  }

  .vestee-cliff-period {
    grid-area: vestee-cliff-period;
  }

  .vesting-period {
    grid-area: vesting-period;
  }

  /* ------- tokens */
  .treasury-address {
    grid-area: treasury-address;
  }

  .receiver-address {
    grid-area: receiver-address;
  }

  .token-amount {
    grid-area: token-amount;
  }

  .token-type {
    grid-area: token-type;
  }

  .token-id {
    grid-area: token-id;
  }

  .token-name {
    grid-area: token-name;
  }

  .purpose {
    grid-area: purpose;
  }

  /* ------- other */
  .sign-btn {
    grid-area: sign-btn;
  }

  .signed-amount {
    grid-area: signed-amount;
  }
`

export const CouncilActionToSignBodyStyled = styled.div<{ theme: MavrykTheme; actionId: CouncilsFormsIds }>`
  display: grid;
  grid-template-columns: ${({ actionId }) => CouncilActionsToSignGridMapper[actionId].columnsTemplate};
  grid-template-rows: ${({ actionId }) => CouncilActionsToSignGridMapper[actionId].rowsTemplate};
  grid-template-areas: ${({ actionId }) => CouncilActionsToSignGridMapper[actionId].areaTemplate};

  align-items: center;

  height: calc(100% - 30px);

  margin-top: 15px;
  row-gap: 15px;
  column-gap: 25px;

  .signed-amount {
    width: fit-content;
    margin: 0 auto;
  }

  .sign-btn {
    max-width: 180px;
    width: 100%;
    margin: 0 auto;
  }

  ${ACTION_TO_SIGN_AREAS_NAMES}
  ${COUNCIL_COLUMN_STYLES}
`
