import { useState } from 'react'
import WertWidget from '@wert-io/widget-initializer'
import { Link } from 'react-router'

// utils
import { getWertOptions } from 'app/App.components/ConnectWallet/Wert/WertIO.const'

// view
import { WalletDetails } from 'app/App.components/ConnectWallet/ConnectedWalletInfo'
import ConnectWalletBtn from 'app/App.components/ConnectWallet/ConnectWalletBtn'
import Icon from 'app/App.components/Icon/Icon.view'
import WertIoPopup from 'app/App.components/ConnectWallet/Wert/WertIoPopup'
import { TopBarLinks } from './TopBarLinks/TopBarLinks.controller'
import { MobileTopBar } from './TopBarLinks/MobileTopBar.controller'
import { MenuLogo } from '../Menu.style'
import { MenuMobileBurger, MenuTopStyled } from './MenuTopBar.style'

// hooks
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { DEV_MAVEN_URL, PROD_MAVEN_URL } from 'consts/global.const'

type MenuTopBarProps = {
  burgerClickHandler: () => void
  openChangeNodePopupHandler: () => void
  isExpandedMenu: boolean
}

export const PRODUCTS_LINKS = [
  {
    name: 'Dapp',
    href: process.env.REACT_APP_IS_DEMO === 'true' ? PROD_MAVEN_URL : DEV_MAVEN_URL,
    disabled: false,
    path: '/',
  },
  // {
  //   name: 'Liquidity Baking',
  //   href: 'https://mavryk.finance/liquidity-baking',
  //   disabled: false,
  //   path: '/liquidity-baking',
  // },
  // { name: 'Mavryk Bakeries', href: 'https://mavryk.finance/bakery', disabled: false },
]

export const ABOUT_LINKS = [
  { name: 'MVN Token (Soon)', href: '/', disabled: true },
  { name: 'Team', href: 'https://mavenfinance.io/#team', disabled: false, path: 'https://mavenfinance.io/#team' },
  // TODO: [MAV-501]
  // { name: 'Who we are', href: 'https://mavryk.finance/', disabled: false },
  // { name: 'Roadmap', href: 'https://mavryk.finance/#roadmap', disabled: false },
]

export const BLOG_LINKS = []

export const DOCS_LINKS = [
  {
    name: 'Litepaper',
    href: 'https://mavenfinance.io/litepaper',
    disabled: false,
    path: 'https://mavenfinance.io/litepaper',
  },
  { name: 'DAO Docs', href: 'https://docs.mavenfinance.io/', disabled: false },
  { name: 'Security Audits (Soon)', href: '/', disabled: true },
  { name: 'Github', href: 'https://github.com/mavenfinance/', disabled: false },
]

export const MenuTopBar = ({ burgerClickHandler, isExpandedMenu, openChangeNodePopupHandler }: MenuTopBarProps) => {
  const {
    preferences: { themeSelected },
    toggleWertLoader,
  } = useDappConfigContext()
  const { userAddress } = useUserContext()
  const { bug } = useToasterContext()

  const [showMobileTopBar, setShowMobileTopBar] = useState(false)
  const [showWertIoPopup, setShowWertIoPopup] = useState(false)

  const logoImg = `/images/${themeSelected}/logo.svg`
  const logoMobile = '/logo-mobile.svg'

  const toggleSidebarOpen = () => burgerClickHandler()

  const closeAllMenusHander = () => {
    setShowMobileTopBar(false)
    if (isExpandedMenu) burgerClickHandler()
  }

  const showWertIoErrorToaster = () => {
    bug('Error while interaction with wert io service happened, try later', 'Wert io interaction error')
  }

  const mountWertWiget = (commodity: string) => {
    toggleWertLoader(true)
    const wertOptions = getWertOptions(commodity, setShowWertIoPopup, showWertIoErrorToaster, () =>
      toggleWertLoader(false),
    )
    const wertWidgetInstance = new WertWidget(wertOptions)
    wertWidgetInstance.mount()
  }

  return (
    <>
      <MenuTopStyled>
        <div className="left-side">
          <MenuMobileBurger onClick={toggleSidebarOpen} className={isExpandedMenu ? 'expanded' : ''}>
            <Icon id="menuOpen" />
          </MenuMobileBurger>

          <Link to="/">
            <MenuLogo alt="logo" className={'desktop-logo'} src={logoImg} />
            <MenuLogo alt="logo" className={'mobile-logo'} src={logoMobile} />
          </Link>
        </div>
        <div className="grouped-links">
          <TopBarLinks groupName={'Products'} groupLinks={PRODUCTS_LINKS} />
          <TopBarLinks groupName={'About'} groupLinks={ABOUT_LINKS} />
          <TopBarLinks groupName={'Blog 🔥'} groupLinks={BLOG_LINKS} groupNameLink="https://blog.mavenfinance.io/" />
          <TopBarLinks groupName={'Docs'} groupLinks={DOCS_LINKS} />
        </div>
        <div className="right-side">
          {!userAddress ? <ConnectWalletBtn /> : <WalletDetails mountWertWiget={mountWertWiget} />}
          <div className="settingsIcon" onClick={openChangeNodePopupHandler}>
            <Icon id="gear" />
          </div>
        </div>

        <div className="mobile-menu">
          {showMobileTopBar ? (
            <div className="settingsIcon" onClick={openChangeNodePopupHandler}>
              <Icon id="gear" />
            </div>
          ) : (
            <MenuMobileBurger onClick={toggleSidebarOpen} className={isExpandedMenu ? 'expanded' : ''}>
              <Icon id="menuOpen" />
            </MenuMobileBurger>
          )}

          <Link to="/">
            <MenuLogo alt="logo" className={'mobile-logo'} src={logoMobile} />
          </Link>

          <div className="top-bar-toggler" onClick={() => setShowMobileTopBar(!showMobileTopBar)}>
            {showMobileTopBar ? <Icon id="close-stroke" /> : <Icon id="mobileTopBarToggler" />}
          </div>
        </div>

        <MobileTopBar show={showMobileTopBar} closeMobileMenu={closeAllMenusHander} mountWertWiget={mountWertWiget} />
      </MenuTopStyled>
      <WertIoPopup closePopup={() => setShowWertIoPopup(false)} isOpened={showWertIoPopup} />
    </>
  )
}
