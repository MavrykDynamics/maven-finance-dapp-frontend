import styled, { css } from 'styled-components'
import { MavenTheme } from '../../../styles/interfaces'
import { CardHover } from 'styles'

export const ExpandStyled = styled(CardHover)`
  margin: 0;
  padding: 0;

  .expand-header {
    display: grid;
    grid-template-columns: auto 120px;
    align-items: center;
    min-height: 73px;
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
      color: ${({ theme }) => theme.linksAndButtons};
      margin-right: 8px;
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

    article,
    .expand-header {
      cursor: auto;
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
      padding: 20px 25px;
      align-items: flex-start;
      grid-template-columns: 0.6fr 0.8fr 0.5fr 0.45fr 0.4fr auto;
    }

    article,
    .expand-header {
      cursor: auto;
    }
  }
`

export const ExpandArticleStyled = styled.article<{ $show?: boolean; theme: MavenTheme }>`
  width: 100%;
  max-height: 0;
  height: fit-content;
  cursor: pointer;
  opacity: 0;
  visibility: hidden;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    border-top: 1px solid ${({ theme }) => theme.divider};
    width: 100%;
    left: 0;
    top: 1px;
  }

  ${({ $show }) =>
    $show
      ? css`
          max-height: 100%;
          visibility: visible;
          opacity: 1;
        `
      : ''}
`
