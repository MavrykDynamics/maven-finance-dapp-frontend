import styled from 'styled-components'
import { FontSize, FontWeight } from 'styles/typography'
import { MavenTheme } from 'styles/interfaces'
import {
  INFO_DEFAULT,
  INFO_ERROR,
  INFO_SUCCESS,
  INFO_WARNING,
  INFO_MEDIUM,
  INFO_LARGE,
  INFO_SMALL,
} from './info.constants'

export const InfoBlock = styled.blockquote<{ theme: MavenTheme }>`
  border-radius: 10px;
  margin: 0;
  padding: 10px 20px;
  column-gap: 20px;

  display: flex;
  align-items: center;
  background-color: ${({ theme }) => theme.messagesBackground};

  > .child {
    margin-left: auto;
    width: fit-content;
  }

  p {
    font-weight: ${FontWeight.medium};
    font-size: ${FontSize.base};
    line-height: 20px;
    color: ${({ theme }) => theme.regularText};

    a,
    a * {
      cursor: pointer;
      display: inline;
      color: ${({ theme }) => theme.linksAndButtons};
    }
  }

  .info-icon {
    height: 16px;
    width: 16px;
    flex-shrink: 0;
  }

  &.hasChild {
    p {
      max-width: 65%;
    }
  }

  &.${INFO_SMALL} {
    padding: 0 20px;
  }

  &.${INFO_MEDIUM} {
    padding: 10px 20px;
  }

  &.${INFO_LARGE} {
    padding: 22px 40px;
  }

  &.hasBorder {
    background-color: ${({ theme }) => theme.messagesBackground};
    border-width: 1px;
    border-style: solid;
  }

  /* Just info styling to notify user  */
  &.${INFO_DEFAULT} {
    border-color: ${({ theme }) => theme.infoColor};

    .info-icon {
      fill: ${({ theme }) => theme.infoColor};
    }
  }

  /* Error styling to show user danger zone  */
  &.${INFO_ERROR} {
    border-color: ${({ theme }) => theme.downColor};

    .info-icon {
      fill: ${({ theme }) => theme.downColor};
    }
  }

  /* Error styling to show user warning zone  */
  &.${INFO_WARNING} {
    border-color: ${({ theme }) => theme.riskColor};

    .info-icon {
      fill: ${({ theme }) => theme.riskColor};
    }
  }

  /* Success styling to show user that smth will be good  */
  &.${INFO_SUCCESS} {
    border-color: ${({ theme }) => theme.upColor};

    .info-icon {
      fill: ${({ theme }) => theme.upColor};
    }
  }
`
