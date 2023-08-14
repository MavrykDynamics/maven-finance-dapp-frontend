import styled from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'
import { Card, CardHeader } from 'styles'

export const SatelliteSideBarStyled = styled(Card)`
  padding: 24px 0;
  margin-top: 0;
  max-width: 310px;

  h2 {
    font-weight: 600;
    font-size: 18px;
    margin-bottom: 25px;
    color: ${({ theme }) => theme.textColor};

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
    background-color: ${({ theme }) => theme.cardBorderColor};
    position: absolute;
    bottom: -1px;
  }

  > a {
    display: block;
    margin: 0 auto 30px auto;
    max-width: 250px;
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
    background: ${({ theme }) => theme.valueColor};
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
    color: ${({ theme }) => theme.valueColor};
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
    font-weight: 500;
    font-size: 14px;
    color: ${({ theme }) => theme.textColor};
  }

  var {
    max-width: 50%;
    color: ${({ theme }) => theme.dataColor};

    * {
      font-style: normal;
      font-weight: 600;
      font-size: 16px;
      color: ${({ theme }) => theme.dataColor};
      white-space: nowrap;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      margin: 0;

      svg {
        stroke: ${({ theme }) => theme.dataColor};
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

export const SidebarUserButton = styled.div`
  position: relative;
  left: -20px;

  display: flex;
  align-items: center;
  column-gap: 10px;
  padding: 4px 0;

  > .img-wrapper,
  svg {
    height: 35px;
    width: 35px;
    fill: ${({ theme }) => theme.textColor};

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
    }
  }

  .name,
  .link {
    font-size: 14px;
    font-weight: 600;
    line-height: 16px;

    text-align: start;
  }

  .name {
    color: ${({ theme }) => theme.textColor};
  }
`
