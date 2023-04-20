import styled from 'styled-components/macro'

export const CouncilFormStyled = styled.form`
  padding: 24px 30px;
  border-top: 1px solid ${({ theme }) => theme.cardBorderColor};
  margin-top: 1px;
  position: relative;

  .form-h1 {
    margin-top: 15px;
    margin-bottom: 0;
  }

  input,
  p {
    font-weight: 500;
    font-size: 14px;
    line-height: 24px;
  }

  p {
    color: ${({ theme }) => theme.textColor};
    margin-bottom: 16px;
    margin-top: 1px;
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    padding-top: 1px;
    row-gap: 18px;

    &.form-grid-button-right {
      padding-bottom: 16px;
    }

    .form-grid-adress {
      color: ${({ theme }) => theme.upColor};
      padding-top: 12px;
      padding-left: 16px;
    }
  }

  label {
    font-weight: 600;
    font-size: 14px;
    line-height: 21px;
    color: ${({ theme }) => theme.textColor};
    padding-left: 8px;
    padding-bottom: 5px;
    display: block;
  }

  .form-ipfs {
    margin-bottom: 0;

    label {
      margin-bottom: 2px;
    }
  }

  .btn-group {
    padding-top: 40px;
    padding-bottom: 15px;
    margin: 0 0 0 auto;
    width: 300px;
  }

  .button-aligment {
    display: flex;
    align-items: end;
    margin: 0 0 -5px auto;
    width: 300px;
  }

  .textarea-group {
    padding-top: 20px;
  }

  .pinned-child {
    display: flex;
    align-items: center;
    padding: 0 8px;

    font-weight: 600;
    font-size: 14px;
    line-height: 14px;

    color: ${({ theme }) => theme.textColor};
  }

  .drop-down {
    & > div > div {
      max-width: 250px;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }
  }

  &.update-council-member-info {
    border: none;

    .plus-btn {
      width: 280px;
    }
  }
`
