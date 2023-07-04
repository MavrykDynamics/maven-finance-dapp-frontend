import styled from 'styled-components/macro'
import { MavrykTheme } from '../../styles/interfaces'
import { hangInSpace } from 'styles/animations'

export const ErrorPageWrapper = styled.div<{ theme: MavrykTheme }>`
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
  font-family: 'Metropolis', Helvetica, Arial, sans-serif;
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
  align-items: flex-start;
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
