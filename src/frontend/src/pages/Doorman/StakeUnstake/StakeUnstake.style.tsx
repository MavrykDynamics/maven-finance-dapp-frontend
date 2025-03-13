import styled from 'styled-components'
import { Card } from 'styles'
import { MavenTheme } from '../../../styles/interfaces'

export const StakeUnstakeStyled = styled.div`
  position: relative;
  margin-top: 30px;
  display: grid;
  grid-template-columns: auto 500px;
  grid-gap: 30px;

  .errorWrapper {
    margin: 15px auto;
  }
`

export const StakeUnstakeCard = styled.div<{ theme: MavenTheme }>`
  display: flex;
  justify-content: space-between;
  min-width: 130px;

  font-size: 14px;
  font-weight: 600;
`

export const StakeUnstakeCards = styled(Card)<{ theme: MavenTheme }>`
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  padding: 30px;
  margin: 0;

  font-size: 14px;
  font-weight: 600;

  border-radius: 10px;
`

export const StakeUnstakeActionCard = styled(Card)<{ theme: MavenTheme }>`
  border-radius: 10px;

  text-align: center;
  font-size: 14px;
  font-weight: 600;

  margin: 0;
  padding: 18px 30px;

  & .infoBlockWrapper {
    margin: 15px auto;
  }
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
export const StakeUnstakeInputLabels = styled.h3`
  display: flex;
  justify-content: space-between;
  margin-left: 25px;

  &:last-of-type {
    margin-top: 5px;
  }

  font-weight: 600;
  font-size: 14px;
  line-height: 21px;

  .minAmount {
    font-size: 14px;
  }
`
export const StakeUnstakeInputWithCoin = styled.div`
  display: flex;
  column-gap: 10px;

  .input-balance {
    color: ${({ theme }) => theme.linksAndButtons};

    .prefix {
      color: ${({ theme }) => theme.primaryText};
    }

    .sufix {
      margin-right: 6px;
    }
  }

  .pinned-child {
    display: flex;
    align-items: center;
    padding: 0 15px;

    min-width: max-content;
    height: 100%;

    font-weight: 600;
    font-size: 20px;
    line-height: 20px;

    color: ${({ theme }) => theme.placeholders};
  }
`

export const StakeUnstakeAmount = styled.div`
  display: flex;
  margin-right: 15px;

  color: ${({ theme }) => theme.primaryText};
  cursor: pointer;
  margin-right: 15px;

  p {
    margin: 0;
    color: ${({ theme }) => theme.linksAndButtons};
  }
`

export const StakeUnstakeRate = styled(StakeUnstakeAmount)`
  margin: 7px 0 0 25px;
  cursor: auto;

  p {
    color: ${({ theme }) => theme.primaryText};
  }
`

export const StakeUnstakeErrorMessage = styled.div<{ $inputOk: boolean; $accountPkh?: string; theme: MavenTheme }>`
  color: ${({ $inputOk, theme }) => ($inputOk ? theme.upColor : theme.downColor)};
  font-size: 12px;
  font-weight: 600;
`

export const StakeUnstakeInputLabel = styled.div<{ theme: MavenTheme }>`
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

export const StakeUnstakeBalance = styled.div<{ theme: MavenTheme }>`
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
    color: ${({ theme }) => theme.subHeadingText};

    display: flex;
    align-items: center;
  }

  img {
    margin-right: 10px;
    width: 42px;
    height: 45px;
  }

  .amount {
    font-size: 16px;
    margin: 0;
    color: ${({ theme }) => theme.primaryText};
  }

  .balance-btn-group {
    display: flex;
    align-items: center;
    column-gap: 10px;
  }

  .amount p {
    margin: 0;
  }
`

export const StakeUnstakeRightPart = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 150px;
  position: relative;

  .tooltip-trigger {
    position: absolute;
    right: -17px;

    svg {
      fill: ${({ theme }) => theme.linksAndButtons};
    }
  }
`

export const StakeLabel = styled.blockquote`
  margin: 0;
  padding: 4px 12px;

  font-weight: 600;
  font-size: 12px;
  line-height: 18px;
  text-transform: uppercase;

  color: ${({ theme }) => theme.downColor};
  border: 1px solid ${({ theme }) => theme.downColor};
  border-radius: 10px;
`

export const StakeDelegatedUser = styled.div`
  display: flex;
  align-items: center;
  padding: 5px 10px;

  border: 1px solid ${({ theme }) => theme.divider};
  border-radius: 100px;

  .userImage {
    width: 35px;
    height: 35px;
    margin-right: 10px;

    fill: ${({ theme }) => theme.divider};

    img {
      width: inherit;
      height: inherit;
      object-fit: cover;

      border-radius: 50%;
    }
  }

  h3,
  span {
    font-size: 14px;
    font-weight: 600;
    line-height: 21px;
    color: ${({ theme }) => theme.subHeadingText};
  }

  span {
    color: ${({ theme }) => theme.linksAndButtons};
  }
`
