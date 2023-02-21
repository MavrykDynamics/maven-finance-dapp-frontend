import styled from 'styled-components/macro'
import { Card } from 'styles'

import { cyanColor, downColor } from '../../../styles/colors'
import { MavrykTheme } from '../../../styles/interfaces'

export const StakeUnstakeStyled = styled.div`
  position: relative;
  margin-top: 30px;
  display: grid;
  grid-template-columns: 500px auto;
  grid-gap: 30px;
`

export const StakeUnstakeCard = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  justify-content: center;
  min-width: 130px;

  font-size: 14px;
  font-weight: 600;

  color: ${({ theme }) => theme.subTextColor};

  &:nth-of-type(2) {
    border-left: 1px solid ${({ theme }) => theme.cardBorderColor};
    border-right: 1px solid ${({ theme }) => theme.cardBorderColor};
  }
`

export const StakeUnstakeCards = styled(Card)<{ theme: MavrykTheme }>`
  display: flex;
  flex-direction: column;
  justify-content: center;

  padding: 30px 0;
  margin: 0;

  font-size: 14px;
  font-weight: 600;

  color: ${({ theme }) => theme.subTextColor};
  background-color: ${({ theme }) => theme.containerColor};
  border-radius: 10px;

  .grid-group {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
  }

  .centering-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 20px;
    width: 100%;

    button {
      width: 215px;
    }
  }
`

export const StakeUnstakeActionCard = styled(Card)<{ theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.containerColor};
  border-radius: 10px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.subTextColor};
  margin: 0;
  padding-top: 34px;
  padding-bottom: 34px;
  padding-left: 30px;
  padding-right: 30px;

  .compound-info {
    text-align: left;
    position: relative;
    margin: 0;
    display: flex;
    align-items: center;
    font-weight: 500;
    font-size: 14px;
    line-height: 24px;
    color: ${({ theme }) => theme.textColor};
    bottom: -16px;

    a {
      position: static;
    }
  }
`
export const StakeUnstakeInputColumn = styled.div`
  display: flex;
  flex-direction: column;

  input {
    padding-right: 90px;
    height: 50px;
    font-weight: 600;
    font-size: 22px;

    & ~ div {
      top: 18px;
    }
  }
`
export const StakeUnstakeInputLabels = styled.div`
  margin-bottom: 7px;
`
export const StakeUnstakeInputGrid = styled.div`
  display: grid;
  grid-template-columns: 62px auto;
  grid-gap: 7px;

  > img {
    margin-top: 15px;
  }

  > div {
    position: relative;
  }
`

export const StakeUnstakeMin = styled.div`
  color: ${({ theme }) => theme.textColor};
  font-weight: 600;
  font-size: 14px;
  float: left;
  display: inline-block;
  margin-left: 10px;
`

export const StakeUnstakeMax = styled.button<{ theme: MavrykTheme }>`
  color: ${({ theme }) => theme.dataColor};
  font: inherit;
  font-weight: 600;
  font-size: 14px;
  float: right;
  display: inline-block;
  margin-right: 10px;
  text-decoration: underline;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  outline: inherit;
`
export const StakeUnstakeErrorMessage = styled.div<{ inputOk: boolean; accountPkh?: string; theme: MavrykTheme }>`
  color: ${({ inputOk, theme }) => (inputOk ? theme.upColor : theme.downColor)};
  font-size: 12px;
  font-weight: 600;
`

export const StakeUnstakeInput = styled.input<{ theme: MavrykTheme }>`
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.placeholderColor};
  margin: 10px 0;
  font-size: 22px;
  font-weight: 600;
  border: none;
  padding: 0 20px;
  border-radius: 10px;
  color: ${({ theme }) => theme.subTextColor};
  flex: 0 0 1;
  position: relative;
`

export const StakeUnstakeInputLabel = styled.div<{ theme: MavrykTheme }>`
  position: absolute;
  right: 17px;
  color: ${({ theme }) => theme.subTextColor};
  font-size: 22px;
  font-weight: 600;
`

export const StakeUnstakeRate = styled.div`
  font-size: 14px;
  font-weight: 600;
  align-self: flex-end;
  display: flex;
  align-items: center;
  margin-right: 10px;
  color: ${({ theme }) => theme.headerSkyColor};
  margin-top: 5px;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: right;

  span {
    flex-shrink: 0;
  }

  p {
    margin: 0;
    white-space: nowrap;
  }
`

export const StakeUnstakeButtonGrid = styled.div`
  margin: 25px auto 0 auto;
  display: flex;
  justify-content: space-between;
  column-gap: 10px;

  button {
    width: 50%;
  }

  &.compound {
    button {
      padding: 0;
      width: 33%;
    }
  }
`

export const StakeUnstakeBalance = styled.div<{ theme: MavrykTheme }>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  height: 100%;

  h3 {
    font-size: 14px;
    font-weight: 600;
    line-height: 21px;
    color: ${({ theme }) => theme.textColor};
  }

  img {
    margin-bottom: 10px;
  }

  div {
    max-width: max-content;
    font-size: 16px;
    font-weight: 600;
    line-height: 21px;
    color: ${({ theme }) => theme.dataColor};
  }
`

export const StakeLabel = styled.blockquote`
  position: absolute;
  bottom: -25px;
  color: ${downColor};
  margin: 0;
  line-height: 19px;
  border: 1px solid ${downColor};
  font-weight: 400;
  font-size: 10px;
  border-radius: 10px;
  padding: 0 11px;
`

export const StakeCompound = styled.button<{ theme: MavrykTheme }>`
  margin: 0;
  border: 1px solid ${cyanColor};
  color: ${cyanColor};
  font-weight: 400;
  font-size: 10px;
  line-height: 20px;
  height: 100%;
  margin-top: 18px;
  border-radius: 10px;
  background: none;
  width: 100%;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 120px;
  padding-top: 10px;

  &:hover {
    opacity: 0.8;
  }

  img {
    width: 98px;
    margin-top: 12px;
    margin-bottom: 13px;
  }
`
