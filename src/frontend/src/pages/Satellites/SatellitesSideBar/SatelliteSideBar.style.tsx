import styled from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'
import { Card } from 'styles'

export const SatelliteSideBarStyled = styled(Card)`
  padding: 24px 0;
  margin-top: 0;
  max-width: 310px;

  h2 {
    font-weight: 600;
    font-size: 18px;
    margin-bottom: 25px;

    &::after {
      display: none;
    }
  }
`

export const SideBarSection = styled.aside<{ theme: MavrykTheme }>`
  padding: 0 20px;
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

  button {
    margin-bottom: 38px;
  }
`

export const FAQLink = styled.div<{ theme: MavrykTheme }>`
  font-size: 14px;
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
    font-weight: 500;
    font-size: 14px;
    line-height: 21px;
    color: ${({ theme }) => theme.linksAndButtons};
    text-decoration: underline;
  }
`

export const SideBarItem = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  align-items: center;
  margin-top: 10px;
  margin-bottom: 9px;
  height: 14px;

  h3 {
    font-weight: 600;
    font-size: 14px;

    color: ${({ theme }) => theme.regularText};
  }

  var {
    max-width: 50%;
    color: ${({ theme }) => theme.primaryText};

    * {
      font-style: normal;
      font-weight: 600;
      font-size: 14px;
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

export const SideBarFaq = styled.div<{ theme: MavrykTheme }>`
  padding: 0 20px;
  padding-top: 26px;
  padding-bottom: 21px;
`
