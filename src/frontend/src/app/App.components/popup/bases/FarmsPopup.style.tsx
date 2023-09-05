import styled from 'styled-components'
import { MavrykTheme } from 'styles/interfaces'

export const FarmLpActionsPopupsContent = styled.div<{ theme: MavrykTheme }>`
  row-gap: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 10px;

  .popup-header {
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    font-weight: 600;
    font-size: 18px;
    line-height: 18px;
    color: ${({ theme }) => theme.mainHeadingText};
  }

  .action-btn {
    width: 250px;
  }
`
