import styled from 'styled-components/macro'
import { CardHover } from 'styles'
import { MavrykTheme } from 'styles/interfaces'

export const CouncilMemberStyled = styled(CardHover)<{ theme: MavrykTheme }>`
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 12px 28px;
  margin-bottom: 9px;

  figcaption {
    width: calc(100% - 70px);

    h4 {
      white-space: nowrap;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      font-weight: 600;
      font-size: 14px;
      line-height: 21px;
      color: ${({ theme }) => theme.textColor};
    }

    div {
      font-weight: 600;
      font-size: 16px;
      line-height: 22px;
      color: ${({ theme }) => theme.dataColor};
    }
  }

  figure {
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

  .update-btn {
    width: 100%;
  }

  &.is-me {
    &:hover {
      box-shadow: none;
      border-color: ${({ theme }) => theme.cardBorderColor};
      cursor: default;
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
