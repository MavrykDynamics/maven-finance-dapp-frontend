import styled from 'styled-components'
import { MavenTheme } from '../../../styles/interfaces'
import {Card, FontSize, FontWeight} from 'styles'
import { BUTTON_RADIUS } from 'styles/constants'

export const SatelliteSideBarStyled = styled(Card)`
  padding: 24px 0;
  margin-top: 0;
  max-width: 310px;

  h2 {
    font-weight: ${FontWeight.semibold};
    font-size: ${FontSize.lg};
    margin-bottom: 25px;

    &::after {
      display: none;
    }
  }
`

export const SideBarSection = styled.aside<{ theme: MavenTheme }>`
  padding: 31px 17px;
  position: relative;

  &:first-child {
    padding-top: 0;
  }

  &::after {
    content: '';
    width: calc(100% - 40px);
    height: 1px;
    background-color: ${({ theme }) => theme.divider};
    position: absolute;
    bottom: -1px;
  }

  > a {
    display: block;
    margin: 0 auto 30px auto;
    width: 100%;
  }
`

export const FAQLink = styled.div<{ theme: MavenTheme }>`
  font-size: ${FontSize.base};
  margin: 14px 0;
  padding-left: 20px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    border-radius: 50%;
    top: 8px;
    width: 5px;
    height: 5px;
    background: ${({ theme }) => theme.linksAndButtons};
    left: 5px;
  }

  &.BG-faq-link {
    margin: 10px 0 0 0;
    padding-left: 0;

    &::before {
      content: none;
    }
  }

  > a {
    font-weight: ${FontWeight.medium};
    font-size: ${FontSize.base};
    line-height: 21px;
    color: ${({ theme }) => theme.linksAndButtons};
    text-decoration: underline;
  }
`

export const SideBarItem = styled.div<{ theme: MavenTheme }>`
  display: flex;
  justify-content: space-between;
  font-weight: ${FontWeight.semibold};
  align-items: center;
  margin-top: 10px;
  margin-bottom: 9px;
  height: 14px;

  h3 {
    font-weight: ${FontWeight.medium};
    font-size: ${FontSize.base};

    color: ${({ theme }) => theme.regularText};
  }

  var {
    max-width: 50%;
    color: ${({ theme }) => theme.primaryText};

    * {
      font-style: normal;
      font-weight: ${FontWeight.semibold};
      font-size: ${FontSize.md};
      color: ${({ theme }) => theme.primaryText};
      white-space: nowrap;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      margin: 0;

      svg {
        stroke: ${({ theme }) => theme.primaryText};
        width: 16px;
        margin-left: 8px;
      }
    }
  }
`

export const SideBarFaq = styled.div<{ theme: MavenTheme }>`
  padding: 0 20px;
  padding-top: 26px;
  padding-bottom: 21px;
`

export const SidebarUserButton = styled.div<{ theme: MavenTheme }>`
  border: 2px solid ${({ theme }) => theme.linksAndButtons};
  border-radius: ${BUTTON_RADIUS};

  height: 50px;
  width: 100%;

  display: flex;
  align-items: center;

  column-gap: 10px;
  padding: 0 10px 0 10px;

  > .img-wrapper,
  svg {
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

  > div {
    width: calc(100% - 35px - 10px);
  }

  .name,
  .link {
    font-size: ${FontSize.base};
    font-weight: ${FontWeight.semibold};
    line-height: 16px;
  }

  .link {
    color: ${({ theme }) => theme.linksAndButtons};
  }

  .name {
    color: ${({ theme }) => theme.subHeadingText};

    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    width: 100%;
  }
`
