import styled from 'styled-components'
import { MavrykTheme } from 'styles/interfaces'

export const FooterStyled = styled.div<{ theme: MavrykTheme }>`
  position: relative;
  display: flex;
  align-items: end;
  justify-content: center;
  max-width: 1090px;
  margin: 0 auto;
  padding-bottom: 12px;

  font-weight: 400;
  font-size: 12px;
  line-height: 12px;

  color: ${({ theme }) => theme.textColor};

  .powered-by {
    a {
      color: ${({ theme }) => theme.valueColor};
    }
  }

  .additional-links {
    position: absolute;
    right: 0;

    display: flex;
    column-gap: 20px;

    a {
      color: ${({ theme }) => theme.textColor};
    }
  }
`
