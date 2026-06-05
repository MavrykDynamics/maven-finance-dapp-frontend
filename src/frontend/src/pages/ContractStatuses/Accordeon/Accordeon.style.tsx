import styled from 'styled-components'
import { FontSize, FontWeight } from 'styles/typography'
import { MavenTheme } from '../../../styles/interfaces'

export const AccordionWrapper = styled.div<{ theme: MavenTheme }>`
  transition: 0.5s all;
`

export const AccordionToggler = styled.div<{ theme: MavenTheme }>`
  display: flex;

  justify-content: center;
  align-items: center;
  padding-top: 20px;
  padding-bottom: 4vpx;
  cursor: pointer;
  font-weight: ${FontWeight.regular};
  font-size: ${FontSize.base};
  color: ${({ theme }) => theme.linksAndButtons};

  svg {
    stroke: ${({ theme }) => theme.linksAndButtons};
    fill: transparent;
  }

  .accordion-icon {
    width: 16px;
    height: 12px;
    margin-left: 7px;

    &.down {
      transform: rotate(180deg);
    }
  }
`

export const AccordionContent = styled.div<{ theme: MavenTheme }>`
  display: flex;
  height: 100%;
  max-height: 0;
  height: fit-content;
  overflow-y: scroll;
  overflow-x: hidden;
  padding-left: 30px;
  padding-bottom: 16px;
  row-gap: 8px;
  flex-direction: column;
  transition: 0.5s all;

  opacity: 0;
  transition: opacity 0.5s max-height 0.4s ease-in-out;

  &.expanded {
    opacity: 1;
    max-height: 185px;
    margin-top: 20px;
  }
`

export const AccordionItem = styled.div<{ $status: boolean; theme: MavenTheme }>`
  font-weight: ${FontWeight.medium};
  font-size: ${FontSize.base};
  margin: 5px 0;
  color: ${({ $status, theme }) => ($status ? theme.downColor : theme.upColor)};

  .truncated_text {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  &:last-child {
    margin-bottom: 0;
  }

  &:first-child {
    margin-top: 0;
  }
`
