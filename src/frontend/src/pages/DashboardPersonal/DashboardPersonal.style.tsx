import styled from 'styled-components'

export const DashboardPersonalStyled = styled.div`
  margin-top: 30px;

  .top {
    display: flex;
    column-gap: 20px;
  }

  .tabs-switchers {
    display: flex;
    margin: 30px 0;
    column-gap: 15px;
  }
`

export const DashboardCardHeader = styled.div`
  display: grid;
  grid-template-columns: auto 300px;

  h2 {
    margin: 0;
    font-weight: 700;

    &::after {
      margin-bottom: 7px;
    }
  }
`
