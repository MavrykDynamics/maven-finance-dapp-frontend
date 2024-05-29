import styled from 'styled-components'
import { CardHover } from 'styles'
import { MavenTheme } from 'styles/interfaces'

export const CouncilMemberStyled = styled(CardHover)<{ theme: MavenTheme }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  margin: 0;
  padding: 12px 28px;
  margin-bottom: 9px;

  figcaption {
    width: calc(100% - 70px);

    h4 {
      max-width: 180px;
      font-weight: 600;
      font-size: 14px;
      line-height: 21px;
      color: ${({ theme }) => theme.subHeadingText};
    }

    div {
      font-weight: 600;
      font-size: 16px;
      line-height: 22px;
      color: ${({ theme }) => theme.primaryText};
    }
  }

  .img-wrapper {
    width: 50px;
    height: 50px;
    flex-shrink: 0;
    margin-right: 20px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
    }
  }

  .inner {
    display: flex;
    align-items: center;

    & + button {
      margin-bottom: 16px;
      margin-top: 16px;
    }
  }
`
