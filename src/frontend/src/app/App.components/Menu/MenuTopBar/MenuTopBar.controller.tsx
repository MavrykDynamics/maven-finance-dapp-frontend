import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import WertWidget from '@wert-io/widget-initializer'
import { Link } from 'react-router-dom'

import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { toggleWertLoader } from 'app/App.components/Loader/Loader.action'
import { State } from 'reducers'

import { LIGHT_THEME } from 'app/App.components/DarkThemeProvider/DarkThemeProvider.actions'
import { getWertOptions } from 'app/App.components/ConnectWallet/Wert/WertIO.const'
import { TOASTER_ERROR } from 'app/App.components/Toaster/Toaster.constants'

import { WalletDetails } from 'app/App.components/ConnectWallet/ConnectedWalletInfo'
import ConnectWalletBtn from 'app/App.components/ConnectWallet/ConnectWalletBtn'
import Icon from 'app/App.components/Icon/Icon.view'
import WertIoPopup from 'app/App.components/ConnectWallet/Wert/WertIoPopup'
import { TopBarLinks } from './TopBarLinks/TopBarLinks.controller'
import { MobileTopBar } from './TopBarLinks/MobileTopBar.controller'

import { MenuLogo } from '../Menu.style'
import { MenuMobileBurger, MenuTopStyled } from './MenuTopBar.style'

type MenuTopBarProps = {
  burgerClickHandler: () => void
  openChangeNodePopupHandler: () => void
  isExpandedMenu: boolean
}

export const PRODUCTS_LINKS = [
  {
    name: 'Dapp',
    href:
      process.env.REACT_APP_IS_DEMO === 'true'
        ? 'https://ghostnet.mavryk.finance/'
        : 'https://front-dev.mavryk-dapp.pages.dev',
    disabled: false,
    path: '/',
  },
  {
    name: 'Liquidity Baking',
    href: 'https://mavryk.finance/liquidity-baking',
    disabled: false,
    path: '/liquidity-baking',
  },
  { name: 'Mavryk Bakeries', href: 'https://mavryk.finance/bakery', disabled: false },
]

export const ABOUT_LINKS = [
  { name: 'MVK Token (Soon)', href: '/', disabled: true },
  { name: 'Team', href: 'https://mavryk.finance/#team', disabled: false, path: 'https://mavryk.finance/#team' },
  // TODO: [MAV-501]
  // { name: 'Who we are', href: 'https://mavryk.finance/', disabled: false },
  // { name: 'Roadmap', href: 'https://mavryk.finance/#roadmap', disabled: false },
]

export const BLOG_LINKS = []

export const DOCS_LINKS = [
  {
    name: 'Litepaper',
    href: 'https://mavryk.finance/litepaper',
    disabled: false,
    path: 'https://mavryk.finance/litepaper',
  },
  { name: 'DAO docs (Soon)', href: '/', disabled: true },
  { name: 'Security Audits (Soon)', href: '/', disabled: true },
  { name: 'Github (Soon)', href: 'https://github.com/mavrykfinance/', disabled: true },
]

export const MenuTopBar = ({ burgerClickHandler, isExpandedMenu, openChangeNodePopupHandler }: MenuTopBarProps) => {
  const dispatch = useDispatch()
  const { themeSelected } = useSelector((state: State) => state.preferences)
  const { accountPkh } = useSelector((state: State) => state.wallet)

  const [showMobileTopBar, setShowMobileTopBar] = useState(false)
  const [showWertIoPopup, setShowWertIoPopup] = useState(false)

  const logoImg = themeSelected === LIGHT_THEME ? '/logo-light.svg' : '/logo-dark.svg'
  const logoMobile = '/logo-mobile.svg'

  const toggleSidebarOpen = () => burgerClickHandler()

  const closeAllMenusHander = () => {
    setShowMobileTopBar(false)
    if (isExpandedMenu) burgerClickHandler()
  }

  const showWertIoErrorToaster = () => {
    dispatch(
      showToaster(
        TOASTER_ERROR,
        'Wert io interaction error',
        'Error while interaction with wert io service happened, try later',
      ),
    )
  }

  const mountWertWiget = (commodity: string) => {
    dispatch(toggleWertLoader(true))
    const wertOptions = getWertOptions(commodity, setShowWertIoPopup, showWertIoErrorToaster, () =>
      dispatch(toggleWertLoader(false)),
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
          <TopBarLinks groupName={'Blog 🔥'} groupLinks={BLOG_LINKS} groupNameLink="https://blogs.mavryk.finance/" />
          <TopBarLinks groupName={'Docs'} groupLinks={DOCS_LINKS} />
        </div>
        <div className="right-side">
          {!accountPkh ? <ConnectWalletBtn /> : <WalletDetails mountWertWiget={mountWertWiget} />}
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
