import styled from 'styled-components'
import { MavrykTheme } from 'styles/interfaces'

// h2 headers ------------------
export const H2Title = styled.h2<{ theme: MavrykTheme }>`
  font-weight: 600;
  font-size: 22px;
  color: ${({ theme }) => theme.mainHeadingText};

  &::after {
    content: '';
    display: block;
    width: 80px;
    height: 4px;
    background: ${({ theme }) => theme.mainHeadingText};
    margin: 7px 0 10px 1px;
  }
`

export const H2SimpleTitle = styled(H2Title)<{ theme: MavrykTheme }>`
  &::after {
    display: none;
  }
`

// h3 header ------------------
export const H3TitlePrimary = styled.h3<{ theme: MavrykTheme }>`
  color: ${({ theme }) => theme.mainHeadingText};

  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: 21px; /* 150% */

  /* usually used for svg to has opacity 1, only gor this type of header */
  .opacity-1 {
    opacity: 1;
  }
`

export const H3TitleSecondary = styled.h3<{ theme: MavrykTheme }>`
  font-weight: 500;
  font-size: 14px;
  line-height: 21px; /* 150% */
  color: ${({ theme }) => theme.regularText};
`
