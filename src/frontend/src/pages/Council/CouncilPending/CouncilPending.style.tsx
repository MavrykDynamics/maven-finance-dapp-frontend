import styled from 'styled-components/macro'
import { MavrykTheme } from 'styles/interfaces'
import { Card } from 'styles'

export const CouncilPendingStyled = styled(Card)`
  position: relative;
  margin: 0;
  height: 200px;
  padding: 25px;
  min-width: 247px;

  .number {
    position: absolute;
    right: 20px;
    top: 15px;

    font-weight: 700;
    font-size: 14px;
    line-height: 21px;

    color: ${({ theme }) => theme.strokeColor};
  }

  &.addVestee,
  &.updateVestee,
  &.requestMint,
  &.addCouncilMember {
    min-width: 590px;
    .parameters {
      display: grid;
      grid-template-columns: 130px 170px 150px;
      align-items: center;
    }

    .sign-action {
      margin-left: -30px;
      width: 180px;
    }
  }

  &.requestMint {
    .parameters {
      grid-template-columns: 150px 100px 150px;
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
      grid-template-columns: 140px 135px 171px 185px;
      align-items: center;

      article p {
        white-space: pre-wrap;
      }
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

    color: ${({ theme }) => theme.linksAndButtons};
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
    row-gap: 16px;

    article p {
      white-space: nowrap;
    }

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
      color: ${({ theme }) => theme.primaryText};
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
      font-weight: 600;
      font-size: 14px;
      line-height: 14px;
      color: ${({ theme }) => theme.subHeadingText};
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

  .sign-action {
    margin: 0 auto;
    width: 180px;

    button {
      font-weight: 600;
      font-size: 14px;
      line-height: 14px;
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
    max-height: 460px;
    overflow-y: auto;

    font-weight: 600;
    font-size: 18px;
    line-height: 27px;

    color: ${({ theme }) => theme.subHeadingText};

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
      background-color: ${({ theme }) => theme.scrollBlockColor};
    }
  }

  .shadow {
    position: absolute;
    bottom: 25px;
    height: 50px;
    width: 85%;
    background: ${({ theme }) => `linear-gradient(to bottom, transparent 0%, ${theme.cards} 60%)`};
  }
`
