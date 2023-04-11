import styled from 'styled-components/macro'

import { Card, downColor, cyanColor, boxShadowColor } from '../../styles'
import { MavrykTheme } from '../../styles/interfaces'

export const SubmissionStyled = styled.section<{ theme: MavrykTheme }>`
  display: flex;
  flex-direction: column;
`

export const ProposalSubmissionForm = styled(Card)<{ theme: MavrykTheme }>`
  padding-bottom: 30px;
  position: relative;
  margin-top: 20px;
  padding-top: 28px;

  h1 {
    margin-top: 0;
    margin-bottom: 4px;
  }

  label {
    color: ${({ theme }) => theme.textColor};
    padding-bottom: 9px;
    display: block;
    padding-left: 5px;

    span {
      text-transform: lowercase;
    }
  }

  .description-textarea {
    margin-bottom: 19px;
  }

  .step-2-textarea {
    textarea {
      height: 189px;
    }
  }

  .step-bytes-title {
    margin-bottom: 19px;
    width: 517px;
  }

  .source-code-input-wrap {
    width: 517px;
  }

  .step-bytes {
    position: relative;
    padding-bottom: 15px;

    article {
      margin-top: 27px;
      display: flex;
      flex-direction: column;
      background: ${({ theme }) => theme.backgroundColor};
      border-radius: 10px;
      padding: 22px 50px 20px 40px;
      position: relative;
      border: 1px solid transparent;

      .idx {
        position: absolute;
        left: 15px;
        top: 50%;
        transform: translateY(-50%);
        font-weight: 500;
        font-size: 14px;
        line-height: 14px;
        color: ${({ theme }) => theme.textColor};
      }

      &:hover {
        border-color: ${cyanColor};
        box-shadow: 0px 4px 4px ${boxShadowColor};
      }

      .remove-byte {
        position: absolute;
        right: 15px;
        top: 50%;
        transform: translateY(-50%);

        svg {
          margin-top: 6px;
          width: 20px;
          height: 20px;
          fill: ${({ theme }) => theme.headerColor};
          transition: 0.3s all;
        }
        &:hover {
          svg {
            fill: ${cyanColor};
          }
        }

        &.disabled {
          pointer-events: none;
          opacity: 0.7;
          cursor: not-allowed;
        }
      }

      &.draggabe {
        cursor: grab;
      }

      &.underDrop {
        border-color: ${cyanColor};
        box-shadow: 0px 4px 4px ${boxShadowColor};
      }
    }

    .delete-pair {
      width: auto;
      align-self: flex-end;
      padding: 0 40px;
      margin-top: 20px;

      svg {
        stroke: ${cyanColor};
      }
    }
  }

  .desr-block {
    margin-bottom: 30px;
  }
`

export const FormHeaderGroup = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  margin-bottom: 26px;

  h1 {
    margin: 0;
    margin-right: auto;

    .label {
      color: ${downColor};
      font-weight: normal;
      font-size: 16px;
      padding-left: 16px;
    }
  }
`

export const FormTitleAndFeeContainer = styled.div<{ theme: MavrykTheme }>`
  align-items: flex-start;
  margin-bottom: 27px;
  display: grid;
  grid-template-columns: 517px 1fr 170px;
  column-gap: 30px;
  font-weight: 500;
`
export const FormTitleContainer = styled.div<{ theme: MavrykTheme }>``

export const FormTitleEntry = styled.div<{ theme: MavrykTheme }>`
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  padding-left: 5px;
  color: ${({ theme }) => theme.textColor};
  padding-top: 10px;

  p {
    margin: 0;
    font-weight: 700;
  }

  a {
    color: ${cyanColor};
  }
`

export const FormButtonContainer = styled.div<{ theme: MavrykTheme }>`
  margin-top: 50px;
  display: flex;
  justify-content: flex-end;

  > button {
    max-width: 250px;
    margin-left: 10px;

    &.bytes,
    &.financial {
      svg {
        fill: ${({ theme }) => theme.backgroundColor};
        stroke: transparent;
      }
    }

    &.lock {
      svg {
        fill: ${({ theme }) => theme.valueColor};
        stroke: transparent;
      }
    }
  }
`

export const BytesWarning = styled.div<{ theme: MavrykTheme }>`
  width: 100%;
  padding: 10px 20px;
  border: 1px solid ${({ theme }) => theme.infoColor};
  background: ${({ theme }) => theme.dPurple_container_dPurple};
  font-size: 14px;
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.textColor};
  border-radius: 10px;
  font-weight: 500;

  svg {
    fill: ${({ theme }) => theme.infoColor};
    width: 16px;
    height: 16px;
    margin-right: 20px;
  }
`
