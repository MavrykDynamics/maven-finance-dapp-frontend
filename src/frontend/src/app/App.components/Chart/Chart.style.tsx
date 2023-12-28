import styled from 'styled-components/macro'
import { MavenTheme } from '../../../styles/interfaces'

export const ChartWrapper = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
`
export const ChartLoaderBlock = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`

export const Plug = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  row-gap: 20px;

  width: 100%;
  height: 100%;

  div {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;

    .icon-cow {
      position: absolute;
      width: 73px;
      height: 70px;
    }

    .icon-stars {
      width: 238px;
      height: 82px;
    }
  }

  p {
    margin: 0;
    font-weight: 600;
    font-size: 16px;
    line-height: 22px;

    text-align: center;
    color: ${({ theme }) => theme.regularText};
  }
`

export const ChartStyled = styled.div<{ theme: MavenTheme }>`
  width: 100%;
  height: 100%;
  position: relative;
`

const BaseTooltipStyles = styled.div<{ theme: MavenTheme }>`
  position: absolute;
  z-index: 100;
  padding: 7px 10px 7px 10px;
  background: ${({ theme }) => theme.cards};
  border: 1px solid ${({ theme }) => theme.strokeColor};
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: 5px;
  top: 0;
  left: 0;
  transform: translate(calc(var(--translateX, 0) * 1px), calc(var(--translateY, 0px) * 1px));
  opacity: var(--translateX, 0);
  pointer-events: none;
`

export const AmountDateTooltipStyled = styled(BaseTooltipStyles)`
  .value {
    font-weight: 600;
    font-size: 18px;
    color: ${({ theme }) => theme.primaryText};
    white-space: pre;
    p {
      margin: 0;
    }
  }

  .date {
    font-weight: 600;
    font-size: 12px;
    color: ${({ theme }) => theme.regularText};
    white-space: pre;
  }
`

export const DoubleAmountDateTooltipStyled = styled(AmountDateTooltipStyled)`
  .values {
    display: flex;
    flex-direction: column;
    align-items: center;
    row-gap: 7px;
  }
`

export const MliFeeTooltipStyled = styled(BaseTooltipStyles)`
  width: 150px;
  transform: translate(calc(var(--translateX, 0) * 1px + 65px), calc(var(--translateY, 0px) * 1px));

  > div {
    display: flex;
    justify-content: center;
    column-gap: 5px;

    p {
      margin: 0;
    }

    > * {
      font-weight: 600;
      font-size: 18px;
    }

    .name {
      color: ${({ theme }) => theme.regularText};
    }

    .value {
      color: ${({ theme }) => theme.primaryText};
    }
  }
`
