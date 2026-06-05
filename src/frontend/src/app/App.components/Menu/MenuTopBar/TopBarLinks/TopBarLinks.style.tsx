import styled, { css } from 'styled-components'
import { FontSize, FontWeight } from 'styles/typography'
import { MavenTheme } from 'styles/interfaces'

export const TopBarLinksStyled = styled.div<{ $useClickOpening?: boolean; $selected?: boolean; theme: MavenTheme }>`
  margin: 0 25px;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;

  @media screen and (min-width: 870px) and (max-width: 1400px) {
    margin: 0 15px;
  }

  .group-name {
    font-size: ${FontSize.md};
    line-height: 0;
    transition: 0.35s all;
    cursor: pointer;
    color: ${({ theme }) => theme.menuButtonText};
    font-weight: ${FontWeight.semibold};
    display: flex;
    align-items: center;

    svg {
      width: 20px;
      height: 17px;
      margin-left: 8px;
      transform: rotate(-90deg);
      transition: 0.6s all;
      display: block;
      stroke: ${({ theme }) => theme.menuButtonText};
    }

    a {
      color: ${({ theme }) => theme.menuButtonText};
      transition: 0.35s all;
    }

    &:hover {
      color: ${({ theme }) => theme.selectedColor};

      svg {
        stroke: ${({ theme }) => theme.selectedColor};
        transform: rotate(90deg);
      }

      a {
        color: ${({ theme }) => theme.selectedColor};
      }
    }
  }

  .group-links {
    display: flex;
    padding: 20px 45px 20px 15px;
    background: ${({ theme }) => theme.cards};
    transition: 0.6s all;
    flex-direction: column;
    row-gap: 15px;
    max-width: 285px;
    width: 100%;

    .disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .link-wrapper {
      position: relative;
      width: 100%;

      &.disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      &:hover:not(.disabled),
      &.selected {
        &::before {
          content: '✓';
          position: absolute;
          right: -20px;

          top: 50%;
          transform: translateY(-50%);
          color: ${({ theme }) => theme.selectedColor};
        }
      }
    }

    a {
      text-transform: capitalize;
      position: relative;
      white-space: nowrap;
      font-size: ${FontSize.md};
      transition: 0.35s all;
      width: 120%;
      padding: 6px 0;
      font-weight: ${FontWeight.semibold};
      padding-left: 10px;
      border-radius: 5px;
      color: ${({ theme }) => theme.linksAndButtons};

      &.disabled {
        pointer-events: none;
      }

      &:hover:not(.disabled),
      &.selected {
        color: ${({ theme }) => theme.selectedColor};
      }
    }
  }

  &:hover {
    cursor: pointer;
    svg {
      transform: rotate(90deg);
      stroke: ${({ theme }) => theme.selectedColor};
    }
  }

  ${({ $useClickOpening, $selected }) =>
    $useClickOpening
      ? css`
          display: flex;
          flex-direction: column;
          width: 100%;
          height: fit-content;
          margin: 0;

          .group-name {
            position: relative;
            align-self: flex-start;
            line-height: 100%;
            width: 100%;
            display: flex;
            justify-content: space-between;

            ${() =>
              css`
                &:not(.selected):before {
                  position: absolute;
                  height: 2px;
                  width: 100%;
                  left: 0;
                  bottom: -10px;
                  content: '';
                  background: ${({ theme }) => theme.divider};
                }
              `}

            &.selected {
              color: ${({ theme }) => theme.menuButtonSelected};

              svg {
                stroke: ${({ theme }) => theme.menuButtonSelected};
                transform: rotate(90deg);
              }
            }
          }

          &:nth-last-child(2) {
            .group-name {
              &::before {
                display: none;
              }
            }
          }

          .group-links {
            height: fit-content;
            width: 100vw;
            align-items: center;
            max-height: 0;
            display: none;
            overflow: hidden;
            background: ${({ theme }) => theme.backgroundColor};
            margin-top: 10px;

            a {
              width: 200px;
              margin-left: 15px;
              color: ${({ theme }) => theme.menuButtonText};
            }

            ${() =>
              $selected &&
              css`
                display: flex;
                max-height: fit-content;
              `}
          }
        `
      : css`
          .group-links {
            position: absolute;
            top: 75px;
            opacity: 0;
            visibility: hidden;
            width: 250px;
            border-radius: 10px;
            border: 1px solid ${({ theme }) => theme.linksAndButtons};
          }

          &:hover {
            .group-links {
              opacity: 1;
              visibility: visible;
            }

            .group-name {
              color: ${({ theme }) => theme.selectedColor};

              svg {
                color: ${({ theme }) => theme.selectedColor};
              }
            }
          }
        `}
`
