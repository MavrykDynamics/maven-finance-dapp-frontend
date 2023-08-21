import styled from 'styled-components'

export const NotStakingBannerStyled = styled.div`
  margin-top: 30px;
  max-height: 90px;

  p {
    max-width: 596px;
    margin: 0;
  }

  blockquote {
    margin: 0;
    padding: 19px 40px;
  }

  button {
    width: 250px;
  }

  &.become-satellite {
    p {
      font-weight: 500;
      font-size: 14px;
      line-height: 24px;
      margin: 0;
    }
  }
`
