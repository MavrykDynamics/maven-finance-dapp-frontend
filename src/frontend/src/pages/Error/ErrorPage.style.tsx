import styled from 'styled-components/macro'
import { MavrykTheme } from '../../styles/interfaces'
import { hangInSpace } from 'styles/animations'
import { Z_INDEX_DEFAULT } from 'styles/constants'

export const ErrorPageWrapper = styled.div<{ theme: MavrykTheme }>`
  font-family: 'Metropolis', Helvetica, Arial, sans-serif;
  margin: auto;
  width: 100vw;
  position: relative;
  height: 100vh;
  padding-top: 80px;
  background: url('/images/error-bg.svg');
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: center;

  .left-side {
    position: absolute;
  }
`

export const ErrorPageInner = styled.div<{ theme: MavrykTheme }>`
  display: inline-block;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;

  button {
    border: none;
    outline: none;
    font-family: inherit;
  }

  button svg {
    stroke: ${({ theme }) => theme.containerColor};
  }

  & a {
    text-decoration: none;
    color: ${({ theme }) => theme.textColor};
    font-weight: 900;
  }
`

export const ErrorTopHeader = styled.div<{ theme: MavrykTheme }>`
  color: ${({ theme }) => theme.textColor};
  font-size: 18px;
  font-style: normal;
  font-weight: 600;
  line-height: 27px;
  text-transform: uppercase;
`

export const ErrorMidHeader = styled.div<{ theme: MavrykTheme }>`
  color: ${({ theme }) => theme.textColor};
  font-size: 25px;
  font-style: normal;
  font-weight: 700;
  line-height: 30px;
`

export const ErrorParagraph = styled.div<{ theme: MavrykTheme }>`
  color: ${({ theme }) => theme.textColor};
  text-align: center;
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  margin: 20px 0;
  line-height: 21px;
`
export const ErrorLogoImage = styled.img<{ theme: MavrykTheme }>`
  width: 602px;
  height: 213px;
  margin: 20px 0;
  object-fit: cover;
`

export const Vector1 = styled.img<{ theme: MavrykTheme }>`
  position: absolute;
  left: -158px;
  bottom: 95px;
  z-index: 1;
  animation: ${hangInSpace} 110s ease-in-out infinite alternate;
`

export const Vector2 = styled.img<{ theme: MavrykTheme }>`
  position: absolute;
  right: -100px;
  top: 20px;
  z-index: 1;
  animation: ${hangInSpace} 120s ease-in-out infinite alternate;
`
export const ErrorFooterWrapper = styled.div<{ theme: MavrykTheme }>`
  width: 90%;
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translate(-50%, 0);
  margin: 0 auto;
  padding-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: ${({ theme }) => theme.textColor};

  & .img-wrapper {
    width: 80px;
    height: 16px;
    cursor: pointer;
  }
`

export const ErrorFooterMiddle = styled.div<{ theme: MavrykTheme }>`
  text-align: center;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 10px;

  /* to make block center under the button */
  margin-left: 88px;

  a {
    text-decoration: none;
    color: ${({ theme }) => theme.valueColor};
  }
`

export const ErrorFooterRight = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  align-items: center;
  column-gap: 10px;

  a {
    text-decoration: none;
    text-align: right;
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    color: inherit;
    line-height: normal;
  }
`

export const ErrorMenuTopStyled = styled.div<{ theme: MavrykTheme }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  max-width: 100vw;
  height: 80px;
  z-index: 11;
  background: ${({ theme }) => theme.containerColor};
  display: flex;
  align-items: center;
  padding: 0 22px 0 34px;

  a {
    text-decoration: none;
  }

  .left-side {
    display: flex;
    align-items: center;
  }

  .grouped-links {
    margin: 0 auto;
    height: 100%;
    display: flex;
    align-items: center;
  }

  @media screen and (max-width: 870px) {
    .grouped-links {
      display: none;
    }
  }
`

export const ErrorTopbarLogo = styled.img`
  z-index: ${Z_INDEX_DEFAULT};
  width: 218px;
  height: 43px;
  cursor: pointer;

  &.mobile-logo {
    display: none;
  }

  @media screen and (max-width: 1400px) {
    width: 160px;
  }
`
