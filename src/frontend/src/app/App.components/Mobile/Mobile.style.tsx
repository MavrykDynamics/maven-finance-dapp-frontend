import styled, { createGlobalStyle } from 'styled-components/macro'
import { MavrykTheme } from 'styles/interfaces'

export const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Metropolis', Helvetica, Arial, sans-serif;
    font-display: optional;
    min-width: unset !important;
  }
`

export const MobilePlugBackground = styled.div`
  width: 100vw;
  height: fit-content;
  min-height: 100vh;
  background-image: url('./mobile-plug-background.png');
  background-size: cover;
  background-position: center center;
`

export const MobilePlugWrapper = styled.div<{ theme: MavrykTheme }>`
  width: 100%;
  max-width: 540px;
  height: fit-content;
  min-height: 100vh;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  align-items: center;
  padding: 85px 0 63px 0;
  margin: 0 auto;

  .plug-message {
    font-weight: 600;
    font-size: 22px;
    line-height: 22px;
    text-align: center;
    color: #ffffff;

    .space {
      margin: 10px 0;
    }
  }

  @media only screen and (max-width: 565px), screen and (max-height: 750px) {
    width: 100vw;
    padding: 55px 15px 55px 15px;
  }
`

export const MobilePlugFooter = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  align-items: center;

  .socials {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    max-width: 322px;

    svg {
      fill: #ffffff;
    }

    #twitter {
      svg {
        width: 48px;
        height: 48px;
      }
    }

    #discord {
      svg {
        width: 40px;
        height: 32px;
      }
    }

    #telegram {
      svg {
        width: 30px;
        height: 30px;
      }
    }

    #medium {
      svg {
        width: 36px;
        height: 31px;
      }
    }

    #gitHub {
      svg {
        width: 32px;
        height: 32px;
      }
    }
  }

  .dapp-descr {
    font-weight: 600;
    font-size: 18px;
    line-height: 27px;
    color: #38237c;
    text-align: center;
    margin-top: 45px;
  }

  .copyright {
    font-weight: 600;
    font-size: 18px;
    line-height: 27px;
    color: #38237c;
    text-align: center;
    margin-top: 35px;
  }
`

export const MobilePlugLogoWrapper = styled.div`
  width: 70vw;
  max-width: 500px;
  max-height: 120px;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`
