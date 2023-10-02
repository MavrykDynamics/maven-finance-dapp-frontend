import styled from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'

export const BreakGlassCouncilFormStyled = styled.div<{ theme: MavrykTheme }>`
  position: relative;
  padding: 40px 20px;
  border-top: 1px solid ${({ theme }) => theme.divider};

  &.without-divider {
    border-top: none;
  }

  h1 {
    margin-bottom: 10px;
  }

  p {
    margin-top: 0;
    margin-bottom: 20px;

    color: ${({ theme }) => theme.primaryText};
  }

  input,
  p {
    font-weight: 500;
    font-size: 14px;
    line-height: 24px;
  }

  h1,
  p,
  label {
    padding-left: 10px;
  }

  .address {
    display: flex;
    align-items: center;
    height: 40px;
    margin-left: 20px;
    color: ${({ theme }) => theme.upColor};

    p {
      margin: 0;
    }
  }

  .form {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;

    &.one-column {
      flex-direction: column;
      align-items: flex-start;

      .form-fields {
        width: 100%;
      }
    }
  }

  .form-fields {
    label {
      display: block;
      padding-bottom: 5px;
      font-weight: 600;
      font-size: 14px;
      line-height: 21px;

      color: ${({ theme }) => theme.mainHeadingText};
    }
  }

  .form-ipfs {
    margin: 0;
    margin-bottom: 40px;

    label {
      display: block;
      padding-left: 0;
      font-weight: 700;
      font-size: 14px;
      line-height: 21px;
    }
  }

  .input-size-full-width {
    width: 100%;
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
    margin: 0 0 0 auto;
    width: 300px;
  }

  .btn-wrapper {
    width: 300px;
    margin-bottom: -5px;
  }
`

export const CouncilFormStyled = styled.div<{ theme: MavrykTheme }>``

export const CouncilFormHeaderStyled = styled.div<{ theme: MavrykTheme }>``
