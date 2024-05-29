import styled, { css } from 'styled-components'
import { MavenTheme } from 'styles/interfaces'
import { PaginationPlacementVariants, PAGINATION_SIDE_CENTER, PAGINATION_SIDE_RIGHT } from './pagination.consts'

export const PaginationWrapper = styled.div<{ theme: MavenTheme; $side?: PaginationPlacementVariants }>`
  display: flex;
  max-height: 36px;
  align-items: center;
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  color: ${({ theme }) => theme.regularText};
  width: fit-content;
  margin-left: auto;
  margin-top: 20px;

  ${({ $side }) =>
    $side === PAGINATION_SIDE_RIGHT
      ? css`
          margin-left: auto;
        `
      : $side === PAGINATION_SIDE_CENTER
      ? css`
          margin-right: auto;
          margin-left: auto;
        `
      : ''}

  .input_wrapper {
    max-width: 56px;
    margin: 0 10px;

    input {
      padding: 7.5px 0 7.5px 20px;
      border-color: ${({ theme }) => theme.strokeColor};
    }
  }
`

export const PaginationArrow = styled.div<{ $isRight?: boolean; $isDisabled: boolean; theme: MavenTheme }>`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px 0px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.linksAndButtons};
  height: 36px;
  width: 36px;
  cursor: pointer;
  transition: 0.5s all;
  margin-left: 10px;
  user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;

  ${({ $isRight }) =>
    $isRight
      ? css`
          transform: rotate(180deg);
        `
      : ''}

  ${({ $isDisabled }) =>
    $isDisabled
      ? css`
          opacity: 0.5;
        `
      : css`
          &:hover {
            opacity: 0.8;
          }
        `}

  svg {
    height: 24px;
    width: 10px;
    fill: ${({ theme }) => theme.linksAndButtons};
  }
`
