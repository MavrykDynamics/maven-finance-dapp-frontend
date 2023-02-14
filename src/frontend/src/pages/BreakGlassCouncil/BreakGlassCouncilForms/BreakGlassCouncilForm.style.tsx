import styled from 'styled-components/macro'
import {  headerColor, upColor } from 'styles'
import { MavrykTheme } from '../../../styles/interfaces'

export const FormStyled = styled.div<{ theme: MavrykTheme }>`
  position: relative;
  padding: 40px 20px;
  border-top: 1px solid ${({ theme }) => theme.cardBorderColor};

  &.without-divider {
    border-top: none;
  }

  h1 {
    margin: 0;
  }

  p {
    margin-top: 0;
    margin-bottom: 20px;

    color: ${({ theme }) => theme.textColor};
  }

  input, p {
    font-weight: 500;
    font-size: 14px;
    line-height: 24px;
  }

  h1,
  p,
  label {
    padding-left: 10px;
  }

  button {
    max-width: 250px;
    white-space: nowrap;
  }

  svg {
    stroke: transparent;
    fill: transparent;
  }

  .address {
    display: flex;
    align-items: center;
    height: 40px;
    margin-left: 20px;
    color: ${upColor};
  }

  .form {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
  }

  .form-fields {
    label {
      display: block;
      padding-bottom: 5px;
      font-weight: 600;
      font-size: 14px;
      line-height: 21px;

      color: ${({ theme }) => theme.textColor};
    }
  }

  .form-ipfs {
    margin: 0;
    margin-bottom: 40px;

    label {
      display: block;
      margin-bottom: 6px;
      font-weight: 700;
      font-size: 14px;
      line-height: 21px;

      color: ${headerColor};
    }
  }

  .input-size-primary {
    width: 400px;
  }

  .input-size-secondary {
    width: 330px;
  }

  .input-size-tertiary {
    width: 360px;
  }

  .in-two-columns {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }

  .margin-bottom-20 {
    margin-bottom: 20px;
  }

  .align-to-right {
    display: flex;
    justify-content: flex-end;
  }
`
