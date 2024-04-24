import { CouncilsFormsIds } from 'providers/CouncilProvider/helpers/council.types'
import styled, { css } from 'styled-components'
import { MavenTheme } from 'styles/interfaces'
import { CouncilFormsGridMapper } from './CouncilForms.consts'

const FORMS_AREAS_NAMES = css`
  /* ------- common */

  .admin-address {
    grid-area: admin-address;
  }

  .contract-address {
    grid-area: contract-address;
  }

  /* ------- members */

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

  .receiver-address {
    grid-area: receiver-address;
  }

  .token-amount {
    grid-area: token-amount;
  }

  .token-type {
    grid-area: token-type;
  }

  .token-name {
    grid-area: token-name;
  }

  .purpose {
    grid-area: purpose;
  }

  /* ------- bakers */

  .baker-hash {
    grid-area: baker-hash;
  }

  /* ------- selects/dropdowns */

  .select-contracts {
    grid-area: select-contracts;
  }

  .select-council-member {
    grid-area: select-council-member;
  }

  /* ------- form btn */

  .submit-form {
    grid-area: submit-form;
  }
`

export const CouncilFormStyled = styled.div<{ theme: MavenTheme; $formName: CouncilsFormsIds }>`
  position: relative;
  padding: 30px 20px;
  border-top: 1px solid ${({ theme }) => theme.divider};

  ${FORMS_AREAS_NAMES}
  &.without-divider {
    border-top: none;
  }

  form {
    display: grid;
    grid-template-columns: ${({ $formName }) => CouncilFormsGridMapper[$formName].columnsTemplate};
    grid-template-rows: ${({ $formName }) => CouncilFormsGridMapper[$formName].rowsTemplate};
    grid-template-areas: ${({ $formName }) => CouncilFormsGridMapper[$formName].areaTemplate};

    row-gap: 20px;
    column-gap: 20px;

    align-items: center;

    > div {
      position: relative;

      margin-top: 20px;

      .userAddress {
        height: 40px;
        padding-left: 20px;
      }

      > label {
        position: absolute;
        top: -25px;
        left: 10px;

        font-weight: 600;
        font-size: 14px;
        line-height: 21px;

        color: ${({ theme }) => theme.mainHeadingText};
      }

      .form-ipfs {
        margin: 0;
      }

      /* TODO: should be handled by input */

      .pinned-child {
        display: flex;
        align-items: center;
        padding: 0px 8px;
        font-weight: 600;
        font-size: 14px;
        line-height: 14px;
      }
    }
  }

  .submit-form {
    justify-self: flex-end;
    width: 300px;
  }
`

export const CouncilFormHeaderStyled = styled.div<{ theme: MavenTheme }>`
  display: flex;
  flex-direction: column;

  margin-bottom: 25px;

  .descr {
    color: ${({ theme }) => theme.regularText};
    font-weight: 500;
    font-size: 14px;
    line-height: 24px;

    display: flex;
    align-items: center;
    column-gap: 5px;
  }
`
