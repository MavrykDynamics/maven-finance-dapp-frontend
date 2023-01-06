import styled from 'styled-components'
import { MavrykTheme } from 'styles/interfaces'

export const LoansModalBase = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  flex-direction: column;
  width: 586px;
  padding: 30px 40px 40px;
  position: relative;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 10px;
  background: ${({ theme }) => theme.containerColor};
  border: 1px solid ${({ theme }) => theme.valueColor};

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
