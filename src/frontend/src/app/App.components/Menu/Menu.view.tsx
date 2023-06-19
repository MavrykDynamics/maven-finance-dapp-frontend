import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { State } from 'reducers'

// view
import Icon from '../Icon/Icon.view'
import { MenuTopBar } from './MenuTopBar/MenuTopBar.controller'
import { NavigationLink } from './NavigationLink/NavigationLink.controller'
import NewButton from '../Button/NewButton'

// types
import { MainNavigationRoute } from '../../../utils/TypesAndInterfaces/Navigation'

// styles
import { MenuFooter, MenuGrid, MenuSidebarContent, MenuSidebarStyled } from './Menu.style'

// helpers, costants
import { toggleSidebarCollapsing } from './Menu.actions'
import { mainNavigationLinks } from './NavigationLink/MainNavigationLinks'
import { checkIfLinkSelected } from './NavigationLink/NavigationLink.constants'
import { BUTTON_PRIMARY, BUTTON_ROUND, BUTTON_SECONDARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { MVK_TOKEN_SYMBOL, SMVK_TOKEN_ADDRESS } from 'utils/constants'
import { useStakeContext } from 'providers/StakeProvider/stake.provider'
import { useDAPPConfigContext } from 'providers/DAPPConfig/dappConfig.provider'
import { getUserBalanceByAddress } from 'providers/UserProvider/helpers/userBalances.helpers'
import { useUserContext } from 'providers/UserProvider/user.provider'

type MenuViewProps = {
  openChangeNodePopupHandler: () => void
}

export const SocialIcons = () => (
  <div className="social-wrapper">
    <a href="https://twitter.com/Mavryk_Finance" target="_blank" rel="noreferrer">
      <Icon id="socialTwitter" />
    </a>
    <a href="https://t.me/Mavryk_Finance" target="_blank" rel="noreferrer">
      <Icon id="socialTelegram" />
    </a>
    {/* // TODO: delete after approval  */}
    {/* <a href="https://medium.com/@Mavryk_Finance" target="_blank" rel="noreferrer">
      <Icon id="socialMedium" />
    </a> */}
    <a href="https://linkedin.com/company/mavryk-finance" target="_blank" rel="noreferrer">
      <Icon id="socialLinkedin" />
    </a>
    <a href="https://discord.com/invite/7VXPR4gkT6" target="_blank" rel="noreferrer">
      <Icon id="socialDiscord" />
    </a>
    <a href="https://mavryk.finance/litepaper" target="_blank" rel="noreferrer">
      <Icon id="faqIcon" />
    </a>
    <a href="https://github.com/mavrykfinance/" target="_blank" rel="noreferrer">
      <Icon id="socialGitHub" />
    </a>
  </div>
)

export const MenuView = ({ openChangeNodePopupHandler }: MenuViewProps) => {
  const { getMVKTokensFromFaucet } = useStakeContext()
  const { mvkFaucetAddress } = useDAPPConfigContext()
  const { userTokensBalances } = useUserContext()

  const dispatch = useDispatch()
  const { pathname } = useLocation()
  const { sidebarOpened } = useSelector((state: State) => state.preferences)
  const { isActionActive } = useSelector((state: State) => state.loading)
  const { user, accountPkh } = useSelector((state: State) => state.wallet)
  const {
    mvkTokenAddress: { address: mvkTokenAddress },
  } = useSelector((state: State) => state.contractAddresses)
  const [canGetInitThouthand, setCanGetInitThouthand] = useState(false)

  useEffect(() => {
    const selectedMainRoute = mainNavigationLinks.find(({ routePath = '', subPages = null }) => {
      if (subPages) {
        return subPages.find(({ routeSubPath = '' }) => checkIfLinkSelected(pathname, routeSubPath))
      }

      return checkIfLinkSelected(pathname, routePath)
    })

    setSelectedMainLink(selectedMainRoute?.id || 0)
  }, [accountPkh, pathname, user.isSatellite])

  useEffect(() => {
    setCanGetInitThouthand(
      Boolean(
        accountPkh &&
          (getUserBalanceByAddress({ userTokensBalances, tokenAddress: mvkTokenAddress }) === 0 ||
            getUserBalanceByAddress({ userTokensBalances, tokenAddress: SMVK_TOKEN_ADDRESS }) === 0),
      ),
    )
  }, [accountPkh, mvkTokenAddress, userTokensBalances])

  const [selectedMainLink, setSelectedMainLink] = useState<number>(0)

  const burgerClickHandler = useCallback(() => {
    dispatch(toggleSidebarCollapsing())
  }, [])

  const sidebarBackdropClickHandler = useCallback(() => {
    dispatch(toggleSidebarCollapsing(false))
  }, [])

  const navLinkClickHandler = useCallback(() => {
    if (!sidebarOpened) {
      burgerClickHandler()
    }
  }, [burgerClickHandler, sidebarOpened])

  return (
    <>
      <MenuTopBar
        burgerClickHandler={burgerClickHandler}
        openChangeNodePopupHandler={openChangeNodePopupHandler}
        isExpandedMenu={sidebarOpened}
      />

      <MenuSidebarStyled
        className={`navbar-sticky ${sidebarOpened ? 'menu-expanded' : 'menu-collapsed'}`}
        onClick={sidebarBackdropClickHandler}
      >
        <MenuSidebarContent onClick={(e) => e.stopPropagation()}>
          <MenuGrid>
            {mainNavigationLinks.map((navigationLink: MainNavigationRoute) => {
              return (
                <NavigationLink
                  key={navigationLink.id}
                  selectedMainLink={selectedMainLink}
                  isMobMenuExpanded={sidebarOpened}
                  navLinkClickHandler={navLinkClickHandler}
                  {...navigationLink}
                />
              )
            })}
          </MenuGrid>
          <MenuFooter className={`${sidebarOpened ? '' : 'menu-collapsed'}`}>
            <NewButton
              kind={BUTTON_PRIMARY}
              form={sidebarOpened ? BUTTON_WIDE : BUTTON_ROUND}
              isThin
              onClick={() => getMVKTokensFromFaucet(mvkFaucetAddress)}
              disabled={!canGetInitThouthand || isActionActive}
            >
              {sidebarOpened ? 'MVK Faucet' : 'mvk'}
            </NewButton>
            <a
              href="https://faucet.marigold.dev/ "
              target="_blank"
              rel="noreferrer"
              className={sidebarOpened ? '' : 'small'}
            >
              <NewButton kind={BUTTON_SECONDARY} form={sidebarOpened ? BUTTON_WIDE : BUTTON_ROUND} isThin>
                {sidebarOpened ? ' Ghostnet Faucet' : 'GF'}
              </NewButton>
            </a>
            <a
              href="https://forms.gle/bwmTfpoLKBhaf7yD6"
              target="_blank"
              rel="noreferrer"
              className={sidebarOpened ? '' : 'small'}
            >
              <NewButton kind={BUTTON_SECONDARY} form={sidebarOpened ? BUTTON_WIDE : BUTTON_ROUND} isThin>
                {sidebarOpened ? 'Submit Feedback' : 'SF'}
              </NewButton>
            </a>

            <SocialIcons />
            <span>
              DAPP v0.1
              <br />© Mavryk Finance 2023
            </span>
          </MenuFooter>
        </MenuSidebarContent>
      </MenuSidebarStyled>
    </>
  )
}
