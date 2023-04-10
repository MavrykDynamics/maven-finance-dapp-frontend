import styled from 'styled-components/macro'
import { MavrykTheme } from 'styles/interfaces'
import { Card } from 'styles'

export const CouncilPendingStyled = styled(Card)`
  position: relative;
  margin: 0;
  height: 200px;
  padding: 25px;
  min-width: 237px;

  .number {
    position: absolute;
    right: 20px;
    top: 15px;

    font-weight: 700;
    font-size: 14px;
    line-height: 21px;

    color: ${({ theme }) => theme.cardBorderColor};
  }

  &.addVestee,
  &.updateVestee,
  &.requestMint,
  &.addCouncilMember {
    min-width: 590px;
    .parameters {
      display: grid;
      grid-template-columns: 160px 150px 150px;
      column-gap: 20px;
      align-items: center;
    }

    .sign-action {
      margin-left: -37px;
    }
  }

  &.requestTokens,
  &.transfer {
    min-width: 750px;
    .parameters {
      display: grid;
      grid-template-columns: 130px 144px 150px 186px;
      align-items: center;
    }
  }

  &.setSingleContractAdmin,
  &.updateCouncilMember,
  &.changeCouncilMember,
  &.addCouncilMember {
    h3 {
      max-width: 100%;
    }
  }

  &.setSingleContractAdmin {
    min-width: 380px;

    .parameters {
      display: grid;
      grid-template-columns: 125px 185px;
      align-items: center;
    }
  }

  &.updateCouncilMember {
    min-width: 532px;

    .parameters {
      display: grid;
      grid-template-columns: 118px 144px 185px;
      align-items: center;
    }
  }

  &.changeCouncilMember {
    min-width: 725px;

    .parameters {
      display: grid;
      grid-template-columns: 135px 150px 150px 185px;
      align-items: center;
    }
  }

  &.more {
    margin-right: 19px;
  }

  h3 {
    max-width: 190px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 600;
    font-size: 18px;
    line-height: 18px;
    color: ${({ theme }) => theme.headerColor};
    margin-bottom: 20px;

    &::first-letter {
      text-transform: uppercase;
    }
  }

  .g-centering {
    display: flex;
    justify-content: center;
  }

  .parameters-link {
    display: block;

    color: ${({ theme }) => theme.textColorHovered};
    font-weight: 500;
    font-size: 14px;
    line-height: 24px;

    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    text-decoration: underline;
  }

  .parameters {
    display: flex;
    justify-content: space-between;
    gap: 16px;

    &:first-of-type {
      padding-bottom: 20px;
    }

    .parameters-name {
      text-transform: capitalize;

      max-width: 130px;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }

    .parameters-value,
    .parameters-value p {
      margin: 0;
      color: ${({ theme }) => theme.textColorHovered};
      font-weight: 600;
      font-size: 16px;
      line-height: 16px;
      white-space: nowrap;
      overflow: hidden;
      width: 130px;
      text-overflow: ellipsis;
      display: block;
    }

    .content-width {
      width: max-content;
    }

    p {
      font-weight: 400;
      font-size: 12px;
      line-height: 12px;
      color: ${({ theme }) => theme.headerSkyColor};
      margin-top: 0;
      margin-bottom: 10px;
    }

    .signed-article {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .without-margin {
      margin: 0;
    }
  }

  .parameters-img {
    figure {
      height: 50px;
      width: 50px;
    }
    img {
      height: 50px;
      width: 50px;
      object-fit: cover;
      border-radius: 50%;
    }
  }
`

export const CouncilPendingReviewStyled = styled(Card)`
  margin: 0;
  width: 100%;
  height: 201px;
  margin-bottom: 32px;
  padding: 30px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;

  .review-btn:first-of-type {
    margin-bottom: 20px;
  }
`

export const CouncilModalBase = styled.div<{ theme: MavrykTheme }>`
  h1 {
    margin: 0 0 30px 0;
  }

  p {
    height: 460px;
    overflow-y: auto;

    font-weight: 600;
    font-size: 18px;
    line-height: 27px;

    &::-webkit-scrollbar {
      position: relative;
      width: 15px;
      background-color: transparent;
      left: 10px;
    }

    &::-webkit-scrollbar-thumb {
      background-clip: padding-box;
      border-left: 5px solid rgba(0, 0, 0, 0);
      border-right: 5px solid rgba(0, 0, 0, 0);
      border-radius: 6px;
      -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
      background-color: ${({ theme }) => theme.cardBorderColor};
    }
  }

  .shadow {
    position: absolute;
    bottom: 25px;
    height: 50px;
    width: 85%;
    background: linear-gradient(to bottom, transparent 0%, #160e3f 60%);
  }

  .close-modal {
    position: absolute;
    top: 15px;
    right: 15px;
    cursor: pointer;
    transition: opacity 0.3s;

    &:after,
    &:before {
      content: '';
      height: 30px;
      width: 30px;
      border-top: 3px solid ${({ theme }) => theme.valueColor};
      position: absolute;
      top: 10px;
      right: -12px;
      transform: rotate(-45deg);
    }

    &:before {
      right: 9px;
      transform: rotate(45deg);
    }

    &:hover {
      opacity: 0.7;
    }
  }
`
