import styled from 'styled-components'
import { MavrykTheme } from 'styles/interfaces'

export const FooterStyled = styled.div<{ theme: MavrykTheme }>`
  position: relative;
  bottom: 30px;

  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  max-width: 1090px;
  margin: 0 auto;

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

    a {
      color: ${({ theme }) => theme.textColor};
    }
  }
`
