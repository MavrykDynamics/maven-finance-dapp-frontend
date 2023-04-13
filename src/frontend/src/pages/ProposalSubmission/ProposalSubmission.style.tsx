import styled from 'styled-components/macro'

import { Card, downColor, cyanColor, boxShadowColor, CardHover } from '../../styles'
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
`

// Proposal submittion stage 1 styles
export const ProposalSubmittionStageOneBody = styled.div<{ theme: MavrykTheme }>`
  margin-top: 40px;

  display: grid;
  grid-template-columns: 50% 25% 15%;
  grid-template-rows: 40px minmax(40px, 2fr) 40px;

  justify-content: space-between;
  row-gap: 50px;

  .submitted-data {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
    position: relative;

    p {
      margin: 0;
    }

    .value {
      font-size: 14px;
      font-weight: 700;
      color: ${({ theme }) => theme.textColor};
    }
  }

  .label,
  label {
    position: absolute;
    top: -20px;
    left: 0;
    font-size: 14px;
    font-weight: 500;
    color: ${({ theme }) => theme.textColor};
  }

  .description {
    grid-column-start: 1;
    grid-column-end: 4;
  }
`

// Proposal submittion stage 2 styles
export const SubmitProposalBytes = styled.div<{ theme: MavrykTheme }>`
  margin-top: 20px;
  position: relative;
  padding-bottom: 15px;

  .add-byte {
    left: -20px;
    bottom: 5px;
    position: absolute;
    width: fit-content;
    height: fit-content;

    .tooltip {
      margin-left: 0;
      .text {
        bottom: 150%;
      }
    }
  }
`

export const SubmitProposalBytesPair = styled(CardHover)<{ theme: MavrykTheme }>`
  display: flex;
  flex-direction: column;
  row-gap: 40px;

  margin-top: 30px;
  padding: 40px 50px 30px 40px;

  background: ${({ theme }) => theme.backgroundColor};
  position: relative;

  .idx {
    position: absolute;
    left: 15px;
    top: 50%;
    transform: translateY(-50%);
    font-weight: 500;
    font-size: 14px;
    color: ${({ theme }) => theme.textColor};
  }

  label {
    font-size: 14px;
    font-weight: 600;
  }

  .remove-byte {
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 20px;

    svg {
      width: 20px;
      height: 20px;
      fill: ${({ theme }) => theme.headerColor};
      transition: 0.3s all;
    }

    &:hover {
      svg {
        fill: ${({ theme }) => theme.valueColor};
      }
    }

    &.disabled {
      pointer-events: none;
      opacity: 0.7;
      cursor: not-allowed;
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
    border-color: ${({ theme }) => theme.valueColor};
    box-shadow: 0px 4px 4px ${boxShadowColor};
  }
`

// Proposal submittion stage 3 styles

// Proposal submittion general styles
export const ProposalSubmittionButtons = styled.div<{ theme: MavrykTheme }>`
  margin-top: 30px;
  display: grid;
  grid-template-columns: 220px 220px 220px;
  justify-content: flex-end;
  column-gap: 10px;
`

export const SubmitProposalHeader = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
`

export const SubmitProposalGeneralData = styled(ProposalSubmittionStageOneBody)<{ theme: MavrykTheme }>`
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
