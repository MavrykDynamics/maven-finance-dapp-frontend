import styled from 'styled-components/macro'
import { Card } from 'styles'

import { downColor } from '../../../styles/colors'
import { MavrykTheme } from '../../../styles/interfaces'

export const StakeUnstakeStyled = styled.div`
  position: relative;
  margin-top: 30px;
  display: grid;
  grid-template-columns: auto 500px;
  grid-gap: 30px;
`

export const StakeUnstakeCard = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  justify-content: space-between;
  min-width: 130px;

  font-size: 14px;
  font-weight: 600;

  color: ${({ theme }) => theme.subTextColor};
`

export const StakeUnstakeCards = styled(Card)<{ theme: MavrykTheme }>`
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  padding: 30px;
  margin: 0;

  font-size: 14px;
  font-weight: 600;

  color: ${({ theme }) => theme.subTextColor};
  background-color: ${({ theme }) => theme.containerColor};
  border-radius: 10px;
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
`
export const StakeUnstakeInputColumn = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;

  .errorMessage {
    position: absolute;
    bottom: -45px;
    left: 100px;
  }
`
export const StakeUnstakeInputLabels = styled.div`
  display: flex;
  justify-content: space-between;
  margin-left: 70px;

  &:last-of-type {
    margin-top: 5px;
  }

  font-weight: 600;
  font-size: 14px;
  line-height: 21px;

  color: ${({ theme }) => theme.textColor};

  .minAmount {
    font-size: 16px;
  }
`
export const StakeUnstakeInputWithCoin = styled.div`
  display: flex;
  column-gap: 10px;

  .input-balance {
    color: ${({ theme }) => theme.valueColor};

    .prefix {
      color: ${({ theme }) => theme.headerSkyColor};
    }

    .sufix {
      margin-right: 6px;
    }
  }
`

export const StakeUnstakeAmount = styled.div`
  display: flex;
  color: ${({ theme }) => theme.dataColor};
  cursor: pointer;

  p {
    margin: 0;
    color: ${({ theme }) => theme.navTitleColor};
  }
`

export const StakeUnstakeRate = styled(StakeUnstakeAmount)`
  margin: 7px 0 0 70px;
  cursor: auto;

  p {
    color: ${({ theme }) => theme.dataColor};
  }
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

export const StakeUnstakeButtonGrid = styled.div`
  margin: 65px auto 0 auto;
  display: flex;
  justify-content: space-between;
  column-gap: 10px;
`

export const StakeUnstakeBalance = styled.div<{ theme: MavrykTheme }>`
  position: relative;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  height: 100%;

  h3 {
    font-size: 14px;
    font-weight: 600;
    line-height: 21px;
    margin-bottom: 2px;
    color: ${({ theme }) => theme.textColor};
  }

  img {
    margin-right: 10px;
    width: 42px;
    height: 45px;
  }

  .amount {
    font-size: 16px;
    color: ${({ theme }) => theme.dataColor};
  }

  .balance-btn-group {
    display: flex;
    column-gap: 10px;
  }
`

export const StakeUnstakeRightPart = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 150px;
`

export const StakeLabel = styled.blockquote`
  margin: 0;
  padding: 4px 12px;

  font-weight: 600;
  font-size: 12px;
  line-height: 18px;
  text-transform: uppercase;

  color: ${downColor};
  border: 1px solid ${downColor};
  border-radius: 10px;
`

export const StakeDelegatedUser = styled.div`
  display: flex;
  align-items: center;
  padding: 5px 10px;

  border: 1px solid ${({ theme }) => theme.cardBorderColor};
  border-radius: 100px;

  .userImage {
    width: 35px;
    height: 35px;
    margin-right: 10px;

    fill: ${({ theme }) => theme.cardBorderColor};

    img {
      max-width: 100%;
      max-height: 100%;

      border-radius: 50%;
    }
  }

  h3,
  span {
    font-size: 14px;
    font-weight: 600;
    line-height: 21px;
    color: ${({ theme }) => theme.textColor};
  }

  span {
    color: ${({ theme }) => theme.navTitleColor};
  }
`
