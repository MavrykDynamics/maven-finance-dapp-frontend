import styled from 'styled-components/macro'
import { MavrykTheme } from '../../styles/interfaces'

export const ErrorPageWrapper = styled.div<{ theme: MavrykTheme }>`
  margin: auto;
  width: 100%;
  position: relative;
  height: calc(100vh + 112px);
  padding-top: 112px;
  background-color: red;
  background: url('/images/error-bg.svg');
  display: flex;
  justify-content: center;
  align-items: start;
`

export const ErrorPageInner = styled.div<{ theme: MavrykTheme }>`
  display: inline-block;
  margin-top: 37px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: purple;

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
