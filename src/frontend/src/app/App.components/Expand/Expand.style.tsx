import styled, { css } from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'
import { CardHover, headerColor, royalPurpleColor } from 'styles'

export const ExpandStyled = styled(CardHover)`
  margin: 0;
  padding: 0;

  .expand-header {
    display: grid;
    grid-template-columns: auto 120px;
    align-items: center;
    min-height: 73px;
    cursor: pointer;
  }

  .arrow-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;

    span {
      font-weight: 400;
      font-size: 14px;
      line-height: 21px;
      color: ${headerColor};
      margin-right: 8px;
    }

    .expand-btn {
      color: ${({ theme }) => theme.navIconColor};
      font-weight: 600;
      height: 100%;
      font-size: 16px;
      display: flex;
      column-gap: 8px;
      align-items: center;

      svg {
        height: 8px;
        width: 14px;
        stroke: ${({ theme }) => theme.navIconColor};
        transition: transform 0.3s ease-in-out;
        fill: none;
        stroke-width: 5px;
      }
    }

    &.top {
      svg {
        transform: rotate(-180deg);
      }
    }
  }

  &.expand-governance {
    margin-bottom: 16px;

    .expand-header {
      padding-left: 30px;
      padding-right: 25px;

      grid-template-columns: 0.6fr 0.9fr 0.6fr 0.6fr 0.4fr 0.4fr;
    }
  }

  &.expand-egov {
    margin-bottom: 16px;

    .expand-header {
      padding-left: 30px;
      padding-right: 25px;
      grid-template-columns: 0.7fr 0.9fr 0.6fr 0.4fr 0.4fr;
    }
  }

  &.expand-borrow-tab {
    .expand-header {
      padding: 23px 25px 13px 25px;
      align-items: flex-start;
      grid-template-columns: 0.7fr 0.9fr 0.45fr 0.45fr 0.4fr;
    }
  }
`

export const ExpandArticleStyled = styled.article<{ show?: boolean; theme: MavrykTheme }>`
  width: 100%;
  max-height: 0;
  height: fit-content;
  cursor: pointer;
  overflow: hidden;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    border-top: 1px solid ${royalPurpleColor};
    width: 100%;
    left: 0;
    top: 1px;
  }

  ${({ show }) =>
    show
      ? css`
          max-height: 100%;
        `
      : ''}
`
