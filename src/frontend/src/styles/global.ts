import { createGlobalStyle } from 'styled-components'
import { css } from 'styled-components'
import { MavenTheme } from './interfaces'
import { FontSize, FontWeight, TypePresets } from './typography'

// TODO: remove link styles from here, when all link will be using CustomLink component

export const GlobalStyle = createGlobalStyle<{ theme: MavenTheme }>`
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
  font-size: ${FontSize.base};
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-width: 1460px;
  width: calc(100vw - 16px);

  @media screen and (max-width: 1460px) {
    min-width: 1250px;
  }
}

/* Shared heading defaults: color from theme. Weight comes from TypePresets per-tag. */
h1, h2, h3, h4 {
  color: ${({ theme }) => theme.mainHeadingText};
}

h1 {
  ${TypePresets.h1};
  display: inline-block;
  margin: 30px auto;

  &::after {
    content: '';
    display: block;
    width: 80px;
    height: 4px;
    background: ${({ theme }) => theme.mainHeadingText};
    margin: 7px 0 10px 1px;
  }
}

h2 {
  ${TypePresets.h2};
  display: block;
  margin: 0;

  /* underline bar preserved for bare <h2> usages (modal titles, section headers).
     Styled <H2Title> defines its own ::after; <H2SimpleTitle> sets display: none. */
  &::after {
    content: '';
    display: block;
    width: 80px;
    height: 4px;
    background: ${({ theme }) => theme.mainHeadingText};
    margin: 7px 0 10px 1px;
  }
}

h3 {
  ${TypePresets.h3};
  display: block;
  margin: 0;
}

h4 {
  ${TypePresets.h4};
  margin: 0;
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
  font-size: ${FontSize.base};
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
  font-size: ${FontSize.base};
}

*:focus {
  outline: none;
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


a:hover:not(.full-opacity):not(.disabled) {
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


  /* spaces */
  ${[3, 5, 7, 10, 20, 30].map(
    (n) => css`
      .mb-${n} {
        margin-bottom: ${n}px;
      }

      .mt-${n} {
        margin-top: ${n}px;
      }

      .ml-${n} {
        margin-left: ${n}px;
      }

      .mr-${n} {
        margin-right: ${n}px;
      }
    `,
  )}
`
