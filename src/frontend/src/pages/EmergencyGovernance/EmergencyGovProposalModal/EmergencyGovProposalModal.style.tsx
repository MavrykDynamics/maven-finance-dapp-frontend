import styled from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'

export const EmergencyGovProposalModalContent = styled.div<{ theme: MavrykTheme }>`
  width: 750px;

  > h1 {
    margin-top: -2px;
    margin-bottom: 27px;
  }

  .top-content {
    margin: 10px 0 45px 0;
    display: flex;
    column-gap: 50px;
    align-items: center;

    #inputStyled {
      max-width: 75%;
      font-size: 14px;
    }

    .exit-fee {
      height: 56px;
      position: relative;
      display: flex;
      align-items: center;

      label {
        left: 0;
      }

      p {
        color: ${({ theme }) => theme.regularText};
      }
    }
  }

  .upload-wrap {
    padding-top: 6px;

    label {
      margin-bottom: 0;
    }
  }

  .buttons-container {
    display: flex;
    justify-content: flex-end;
    column-gap: 10px;
    margin-top: 40px;
  }
`
