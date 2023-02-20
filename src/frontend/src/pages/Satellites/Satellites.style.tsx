import styled from 'styled-components/macro'
import { Card } from 'styles'
import { MavrykTheme } from '../../styles/interfaces'

export const SatellitesStyled = styled.div<{ theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.containerColor};
`
export const InfoBlockWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
`

export const SatelliteListStyled = styled.div`
  .feed {
    padding: 16px 25px;
  }
`

export const SatelliteSearchFilter = styled(Card)<{ theme: MavrykTheme; oracle?: boolean; dataFeeds?: boolean }>`
  background-color: ${({ theme }) => theme.containerColor};
  display: flex;
  align-items: center;
  padding: 16px 26px;
  margin-top: 0;
  color: ${({ theme }) => theme.subTextColor};

  input {
    width: 320px;
    height: 40px;
  }
`

export const SatelliteListEmptyContainer = styled.figure<{ theme: MavrykTheme }>`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0;
  color: ${({ theme }) => theme.headerColor};
  font-size: 18px;
  font-weight: 800;
  flex-direction: column;
  padding-top: 16px;
`
