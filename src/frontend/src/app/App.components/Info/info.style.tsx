import styled from 'styled-components/macro'
import { MavrykTheme } from 'styles/interfaces'
import { INFO_DEFAULT, INFO_ERROR, INFO_SUCCESS } from './info.constants'

export const InfoBlock = styled.blockquote<{ theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.connectInfoColor};

  border-width: 1px;
  border-style: solid;
  border-radius: 10px;

  margin: 0;
  padding: 10px 20px;

  p {
    font-weight: 400;
    font-size: 14px;
    line-height: 18px;
  }

  .content {
    display: flex;
    align-items: center;
    column-gap: 20px;

    > .child {
      margin-left: auto;
      width: fit-content;
    }
  }

  .info-icon {
    height: 16px;
    width: 16px;
    flex-shrink: 0;
  }

  &.${INFO_DEFAULT} {
    border-color: ${({ theme }) => theme.infoColor};

    .info-icon {
      fill: ${({ theme }) => theme.infoColor};
    }
  }

  &.${INFO_ERROR} {
    border-color: ${({ theme }) => theme.downColor};

    .info-icon {
      fill: ${({ theme }) => theme.downColor};
    }
  }

  &.${INFO_SUCCESS} {
    border-color: ${({ theme }) => theme.upColor};

    .info-icon {
      fill: ${({ theme }) => theme.upColor};
    }
  }
`
