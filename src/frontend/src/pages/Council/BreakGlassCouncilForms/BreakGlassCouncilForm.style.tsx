import styled, { css } from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'
import { CouncilFormsGridMapper, CouncilsFormsNames } from '../helpers/council.consts'

const FORMS_AREAS_NAMES = css`
  .submit-form {
    grid-area: submit-form;
  }

  .admin-address {
    grid-area: admin-address;
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

  .action-id {
    grid-area: action-id;
  }

  .select-contracts {
    grid-area: select-contracts;
  }

  .select-council-member {
    grid-area: select-council-member;
  }
`

export const CouncilFormStyled = styled.div<{ theme: MavrykTheme; formName: CouncilsFormsNames }>`
  position: relative;
  padding: 30px 20px;
  border-top: 1px solid ${({ theme }) => theme.divider};

  ${FORMS_AREAS_NAMES}

  &.without-divider {
    border-top: none;
  }

  form {
    display: grid;
    grid-template-columns: ${({ formName }) => CouncilFormsGridMapper[formName].columnsTemplate};
    grid-template-rows: ${({ formName }) => CouncilFormsGridMapper[formName].rowsTemplate};
    grid-template-areas: ${({ formName }) => CouncilFormsGridMapper[formName].areaTemplate};

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
    }
  }

  .submit-form {
    &.right {
      justify-self: flex-end;
    }

    width: 300px;
  }
`

export const CouncilFormHeaderStyled = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  flex-direction: column;

  margin-bottom: 30px;

  .descr {
    color: ${({ theme }) => theme.regularText};
    font-weight: 500;
    font-size: 14px;
    line-height: 24px;
  }
`
