import styled, { css } from 'styled-components/macro'
import { Card, CardHover } from '../../styles'
import { MavrykTheme } from '../../styles/interfaces'

export const ProposalSubmissionForm = styled(Card)<{ theme: MavrykTheme }>`
  padding-bottom: 30px;
  position: relative;
  margin-top: 20px;
  padding-top: 28px;

  .stage-descr {
    font-weight: 500;
    font-size: 14px;
    line-height: 24px;
    color: ${({ theme }) => theme.regularText};
    margin-bottom: 30px;
  }

  .bytes-label {
    position: unset;
    margin-bottom: 20px;
  }

  .payments-table {
    position: relative;
  }

  .label,
  label {
    color: ${({ theme }) => theme.mainHeadingText};
  }
`

// Proposal submittion stage 1 styles
export const ProposalSubmittionStageOneBody = styled.div<{ theme: MavrykTheme; isProposalSubmitted?: boolean }>`
  margin-top: 40px;

  display: grid;
  grid-template-columns: ${({ isProposalSubmitted }) => (isProposalSubmitted ? '35% 35% 15%' : '50% 25% 15%')};
  column-gap: ${({ isProposalSubmitted }) => (isProposalSubmitted ? '30px' : '0')};
  grid-template-rows: minmax(40px, max-content) minmax(40px, max-content) 40px minmax(40px, max-content);

  justify-content: space-between;
  row-gap: 50px;

  .submitted-data {
    display: flex;
    flex-direction: column;
    ${({ isProposalSubmitted }) =>
      !isProposalSubmitted
        ? css`
            &.vert-center {
              justify-content: center;
            }
          `
        : ''};
    justify-content: center;
    height: 100%;
    position: relative;

    p {
      margin: 0;
    }

    a {
      font-size: 16px;
      font-weight: 600;
    }

    .invoice-content {
      display: flex;
      align-items: center;
      column-gap: 10px;
    }

    .image-style {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 120px;
      height: 133px;

      border-radius: 10px;
      border: 1px solid ${({ theme }) => theme.linksAndButtons};
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      svg {
        height: 20px;
        width: 20px;

        fill: ${({ theme }) => theme.mainHeadingText};
      }
    }

    .value {
      font-size: 16px;
      font-weight: 600;
      color: ${({ theme }) => theme.regularText};
    }
  }

  .label,
  label {
    position: absolute;
    top: -20px;
    left: 0;
    font-size: 14px;
    font-weight: 600;
  }

  .description {
    grid-column-start: 1;
    grid-column-end: 4;
  }

  .source-code {
    grid-column-start: 1;
    grid-column-end: 4;
  }

  .invoice {
    position: relative;
    grid-column-start: 1;
    grid-column-end: 4;

    > div {
      margin: 0;
    }
  }
`

// Proposal submittion stage 2 styles
export const SubmitProposalBytes = styled.div<{ theme: MavrykTheme }>`
  margin-top: 15px;
  position: relative;
  padding-bottom: 15px;

  .add-byte {
    margin: 20px 0 0 auto;
    width: fit-content;
    height: fit-content;

    .tooltip {
      margin-left: 0;
      .text {
        bottom: 150%;
      }
    }
  }

  .bytes-restriction-banner {
    margin-top: 20px;
  }

  .remove-byte,
  .add-byte {
    &.disabled {
      opacity: 0.7;
      cursor: not-allowed;

      > div {
        pointer-events: none;
      }
    }
  }
`

export const SubmitProposalBytesPair = styled(CardHover)<{ theme: MavrykTheme }>`
  display: flex;
  flex-direction: column;
  row-gap: 50px;

  margin-top: 30px;
  padding: 40px 20px 40px 20px;

  background: ${({ theme }) => theme.backgroundColor};
  position: relative;

  .idx {
    position: absolute;
    left: -20px;
    top: 50%;
    transform: translateY(-50%);
    font-weight: 500;
    font-size: 14px;
    color: ${({ theme }) => theme.regularText};
  }

  label {
    font-size: 14px;
    font-weight: 600;
  }

  .remove-byte {
    position: absolute;
    right: -20px;
    top: 50%;
    transform: translateY(-50%);
    width: 13px;
    height: 13px;

    svg {
      width: 13px;
      height: 13px;
      fill: ${({ theme }) => theme.linksAndButtons};
      transition: 0.3s all;
    }

    .tooltip {
      margin-left: 0;
      .text {
        bottom: 130%;
      }
    }
  }

  &.draggabe {
    cursor: grab;
  }

  &.underDrop {
    border-color: ${({ theme }) => theme.linksAndButtons};
    box-shadow: 0px 4px 4px ${({ theme }) => theme.cardHoverColor};
  }
`

// Proposal submittion stage 3 styles

// Proposal submittion general styles
export const ProposalSubmittionButtons = styled.div<{ theme: MavrykTheme }>`
  margin-top: 40px;
  display: flex;
  justify-content: flex-end;
  column-gap: 10px;

  .btn-wrapper {
    width: 220px;
    position: relative;

    .tooltip-trigger {
      position: absolute;
      top: -15px;
      right: -2px;

      svg {
        fill: ${({ theme }) => theme.linksAndButtons};
      }
    }
  }
`

export const SubmitProposalHeader = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  justify-content: space-between;
`

export const SubmitProposalGeneralData = styled(ProposalSubmittionStageOneBody)<{ theme: MavrykTheme }>`
  grid-template-columns: 32% 35% 15%;
  grid-template-rows: 40px;
  margin-bottom: 20px;
`

// Created proposals swither styles
export const MultyProposalsStyled = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  column-gap: 15px;
  margin-top: 30px;
  margin-left: 5px;
`
