import {
  GlobalStyle,
  MobilePlugBackground,
  MobilePlugFooter,
  MobilePlugLogoWrapper,
  MobilePlugWrapper,
} from './Mobile.style'

import Icon from '../Icon/Icon.view'

export default function Mobile() {
  return (
    <MobilePlugBackground>
      <GlobalStyle />
      <MobilePlugWrapper>
        <MobilePlugLogoWrapper>
          <img src="/mobile-plug-logo.png" alt="maven logo" />
        </MobilePlugLogoWrapper>

        <div className="plug-message">
          Mobile and tablet version of our dapp is not available at this time.
          <div className="space" />
          Please open on a desktop screen or laptop.
        </div>

        <MobilePlugFooter>
          <div className="socials">
            <a href="https://twitter.com/MavenFinanceDAO" id="twitter">
              <Icon id="twitter" />
            </a>
            <a href="https://discord.com/invite/7VXPR4gkT6" id="discord">
              <Icon id="discord" />
            </a>
            <a href="https://t.me/MavenFinance" id="telegram">
              <Icon id="telegram" />
            </a>
            <a href="https://blog.mavrykdynamics.com/" id="medium">
              <Icon id="medium" />
            </a>
            <a href="https://github.com/mavenfinance" id="gitHub">
              <Icon id="gitHub" />
            </a>
          </div>

          <div className="dapp-descr">
            Maven Finance is a DAO operated financial ecosystem that lets users borrow and earn on their terms, while
            participating in the governance of the platform.
          </div>

          <div className="copyright">© Maven Finance 2024</div>
        </MobilePlugFooter>
      </MobilePlugWrapper>
    </MobilePlugBackground>
  )
}
