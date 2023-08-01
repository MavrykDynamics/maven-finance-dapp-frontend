import { createGlobalStyle } from 'styled-components/macro'
import { css } from 'styled-components'
import { MavrykTheme } from './interfaces'

export const GlobalStyle = createGlobalStyle<{ theme: MavrykTheme }>`
* {
  box-sizing: border-box;
}

body {
  font-family: 'Metropolis', Helvetica, Arial, sans-serif;
  font-display: optional;
  margin: 0;
  padding: 0;
  background-color: ${({ theme }) => theme.backgroundColor};
  color: ${({ theme }) => theme.regularText};
  font-size: 14px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-width: 1460px;
  width: calc(100vw - 16px);

  @media screen and (max-width: 1460px) {
    min-width: 1250px;
  }
}

h1, h2, h3, h4 {
  color: ${({ theme }) => theme.mainHeadingText};
  font-weight: normal;
}

h1, h2 {
  font-weight: bold;
  display: inline-block;
  margin: 30px auto;

  font-size: 22px;
  font-weight: 700;

  @media (max-width: 700px) {   
    font-size: 30px;
    margin: 20px auto;
  }

  &::after{
    content: '';
    display: block;
    width: 80px;
    height: 4px;
    background: ${({ theme }) => theme.mainHeadingText};
    margin: 7px 0 10px 1px;
  }
}

h2 {
  display: block;
  margin: 0;

  font-size: 22px;
  font-weight: 600;
}

h3 {
  display: block;
  margin: 0;

  font-size: 30px;
}

h4 {
  margin: 0;
  font-size: 14px;
}

fieldset {
  border: none;
  padding: 0;
  margin: 0;
}

button {
  font-family: 'Metropolis', Helvetica, Arial, sans-serif;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  color: inherit;
}

var {
  font-style: normal;
}


input {
  color: ${({ theme }) => theme.placeholders};
  font-size: 14px;
}

input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
}

input[type='number'] {
  -moz-appearance: textfield;
}

::placeholder {
  color:  ${({ theme }) => theme.placeholders};
  font-size: 14px;
}

*:focus {
  outline: none;
}

a {
  color: ${({ theme }) => theme.linksAndButtons};
  text-decoration: none;
  opacity: 1;
  transition: opacity 0.15s ease-in-out-out;
  will-change: opacity;

  &.isCyan {
    color: ${({ theme }) => theme.linksAndButtons};
  }

  &.underline {
    text-decoration: underline;
  }
}


a:hover:not(.full-opacity) {
  opacity: 0.8;
}

p {
    font-family: "Metropolis", sans-serif;
    display: block;
    margin-block-start: 10px;
    margin-block-end: 10px;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
}

.scroll-block::-webkit-scrollbar-track
  {
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
    border-radius: 10px;
    // TODO: is displayed when there is no scroll, you need to fix or remove
    /* background-color: ${({ theme }) => theme.scrollBlockColor}4d; */
  }
.scroll-block::-webkit-scrollbar
  {
    width: 5px;
    height: 5px;
    background-color: transparent;
  }
.scroll-block::-webkit-scrollbar-thumb
  {
    border-radius: 10px;
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3);
    background-color: ${({ theme }) => theme.scrollBlockColor};
  }

.info-link {
  position: absolute;
  right: 0;
  top: 0;
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;

  &:hover {
    svg {
      opacity: 0.8;
    }
  }

  svg {
    width: 16px;
    height: 16px;
    fill: ${({ theme }) => theme.linksAndButtons};
  }
}
  /* spaces */

  ${[10, 20, 30].map(
    (n) => css`
      .mb-${n} {
        margin-bottom: ${n}px;
      }

      .mt-${n} {
        margin-top: ${n}px;
      }
    `,
  )}
`
