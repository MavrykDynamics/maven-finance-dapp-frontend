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
`

export const ErrorPageInner = styled.div<{ theme: MavrykTheme }>`
  display: inline-block;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;

  button svg {
    stroke: ${({ theme }) => theme.containerColor};
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
