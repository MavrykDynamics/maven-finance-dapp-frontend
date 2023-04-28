import styled from 'styled-components/macro'
import { MavrykTheme } from 'styles/interfaces'
import { INFO_ERROR, INFO_WARNING } from './info.constants'

export const InfoBlock = styled.blockquote<{ theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.connectInfoColor};
  border: 1px solid ${({ theme }) => theme.infoColor};
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
    fill: ${({ theme }) => theme.infoColor};
    height: 16px;
    width: 16px;
    flex-shrink: 0;
  }

  &.${INFO_ERROR} {
    border-color: ${({ theme }) => theme.downColor};

    .info-icon {
      fill: ${({ theme }) => theme.downColor};
    }
  }

  &.${INFO_WARNING} {
    border-color: ${({ theme }) => theme.downColor};

    .info-icon {
      fill: ${({ theme }) => theme.downColor};
    }
  }
`
