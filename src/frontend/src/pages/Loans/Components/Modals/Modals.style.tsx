import styled from 'styled-components'
import { MavrykTheme } from 'styles/interfaces'

export const LoansModalBase = styled.div<{ theme: MavrykTheme }>`
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

  .modalDescr {
    margin-top: 7px;
    font-weight: 600;
    font-size: 14px;
    line-height: 21px;
    color: ${({ theme }) => theme.textColor};
    margin-bottom: 25px;
  }

  .dropdown-name {
    font-weight: 600;
    font-size: 14px;
    line-height: 21px;
    color: ${({ theme }) => theme.textColor};
    padding-left: 7px;
    padding-bottom: 3px;
  }

  .modal-manage-btn {
    margin: 60px auto 0 auto;
    width: 250px;
  }
`
