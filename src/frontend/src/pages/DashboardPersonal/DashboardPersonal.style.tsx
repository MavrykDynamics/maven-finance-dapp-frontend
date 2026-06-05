import styled from 'styled-components'
import { FontWeight } from 'styles/typography'

export const DashboardPersonalStyled = styled.div`
  margin-top: 30px;

  .top {
    display: flex;
    column-gap: 20px;
    margin-bottom: 25px;
  }

  .bottom-grid {
    margin-top: 25px;
  }

  .tabs-switchers {
    display: flex;
    column-gap: 20px;
    margin: 5px 0;
  }
`

export const DashboardCardHeader = styled.div`
  display: grid;
  grid-template-columns: auto 300px;

  h2 {
    margin: 0;
    font-weight: ${FontWeight.bold};

    &::after {
      margin-bottom: 7px;
    }
  }
`
