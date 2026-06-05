import styled from 'styled-components'
import { MavenTheme } from 'styles/interfaces'
import { FontSize, FontWeight, LineHeight, TypePresets } from 'styles/typography'

// h2 headers ------------------
export const H2Title = styled.h2<{ theme: MavenTheme }>`
  ${TypePresets.h2};
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

export const H2SimpleTitle = styled(H2Title)<{ theme: MavenTheme }>`
  &::after {
    display: none;
  }
`

// h3 headers — note these render <h3> but are label-style (small + semibold/medium),
// not visual section headings. Keeping names for back-compat with consumers.
export const H3TitlePrimary = styled.h3<{ theme: MavenTheme }>`
  color: ${({ theme }) => theme.mainHeadingText};
  ${TypePresets.emphasis};
  font-style: normal;
  line-height: ${LineHeight.normal};

  /* usually used for svg to has opacity 1, only gor this type of header */
  .opacity-1 {
    opacity: 1;
  }
`

export const H3TitleSecondary = styled.h3<{ theme: MavenTheme }>`
  color: ${({ theme }) => theme.regularText};
  font-size: ${FontSize.base};
  font-weight: ${FontWeight.medium};
  line-height: ${LineHeight.normal};
`
