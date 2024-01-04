import styled from 'styled-components/macro'
import { MavenTheme } from '../../../styles/interfaces'

export const SatelliteGovernanceCardTitleTextGroup = styled.div<{ theme: MavenTheme }>`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  row-gap: 5px;

  .name {
    font-weight: 600;
    font-size: 14px;
    color: ${({ theme }) => theme.subHeadingText};
  }

  .value {
    margin-bottom: 0;
    margin-top: 0;
    color: ${({ theme }) => theme.primaryText};
    font-weight: 600;
    font-size: 16px;

    &.capitallize {
      &::first-letter {
        text-transform: uppercase;
      }
    }

    svg {
      fill: ${({ theme }) => theme.primaryText};
    }
  }
`

export const SatelliteGovernanceCardDropDown = styled.div<{ theme: MavenTheme }>`
  width: 100%;
  justify-content: space-between;
  display: flex;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  overflow: hidden;
  position: relative;
  padding: 30px 40px;

  &::before {
    content: '';
    position: absolute;
    border-top: 1px solid ${({ theme }) => theme.divider};
    width: 100%;
    left: 0;
    top: 1px;
  }

  h3 {
    margin: 0;
    font-weight: 600;
    font-size: 18px;
    color: ${({ theme }) => theme.mainHeadingText};
  }

  ul {
    padding-left: 0;
  }

  p,
  li {
    font-weight: 400;
    font-size: 14px;
    line-height: 21px;
    color: ${({ theme }) => theme.regularText};
    list-style: none;
  }
`

export const SatelliteGovernanceCardPurposeBlock = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .purpose {
    color: ${({ theme }) => theme.subHeadingText};
    font-weight: 500;
    max-width: 520px;
  }

  .profile-details {
    font-weight: 500;
    font-size: 14px;
    text-decoration: underline;
    color: ${({ theme }) => theme.linksAndButtons};
  }

  .btn-wrapper {
    width: 250px;
    margin-top: 40px;
    display: block;
  }
`

export const SatelliteGovernanceCardVotingBlock = styled.div`
  width: 440px;
  margin-left: auto;

  article {
    margin-bottom: 0;
  }

  .voting-ends {
    color: ${({ theme }) => theme.primaryText};
    font-weight: 700;
    font-size: 14px;
    line-height: 21px;
    margin-top: 10px;
    display: block;
  }

  .voting-buttons {
    margin-bottom: 20px;
    margin-top: 64px;
    justify-content: space-between;
    padding-top: 0;

    button {
      width: 31%;
    }
  }
`
