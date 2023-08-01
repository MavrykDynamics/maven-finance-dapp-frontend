import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'

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
import { mainNavigationLinks } from './NavigationLink/MainNavigationLinks'
import { checkIfLinkSelected } from './NavigationLink/NavigationLink.constants'
import { BUTTON_PRIMARY, BUTTON_ROUND, BUTTON_SECONDARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { SMVK_TOKEN_ADDRESS } from 'utils/constants'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { getUserTokenBalanceByAddress } from 'providers/UserProvider/helpers/userBalances.helpers'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { getMVKTokensFromFaucet } from 'providers/UserProvider/actions/user.actions'
import { GET_MVK_FROM_FAUCET_ACTION } from 'providers/UserProvider/helpers/user.consts'

// hooks
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'

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
  const { bug } = useToasterContext()
  const {
    mvkFaucetAddress,
    toggleSidebarCollapsing,
    contractAddresses: { mvkTokenAddress },
    preferences: { sidebarOpened },
    globalLoadingState: { isActionActive },
  } = useDappConfigContext()
  const { userTokensBalances } = useUserContext()
  const { userAddress, isSatellite } = useUserContext()

  const { pathname } = useLocation()
  const [canGetInitThouthand, setCanGetInitThouthand] = useState(false)

  useEffect(() => {
    const selectedMainRoute = mainNavigationLinks.find(({ routePath = '', subPages = null }) => {
      if (subPages) {
        return subPages.find(({ routeSubPath = '' }) => checkIfLinkSelected(pathname, routeSubPath))
      }

      return checkIfLinkSelected(pathname, routePath)
    })

    setSelectedMainLink(selectedMainRoute?.id || 0)
  }, [userAddress, pathname, isSatellite])

  useEffect(() => {
    setCanGetInitThouthand(
      Boolean(
        userAddress &&
          (getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: mvkTokenAddress }) === 0 ||
            getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: SMVK_TOKEN_ADDRESS }) === 0),
      ),
    )
  }, [userAddress, mvkTokenAddress, userTokensBalances])

  const [selectedMainLink, setSelectedMainLink] = useState<number>(0)

  // requestMVK action  ----------------------
  const requestMVKAction = useCallback(async () => {
    if (!userAddress) {
      bug('Click Connect in the left menu', 'Please connect your wallet')
      return null
    }

    if (!mvkFaucetAddress) {
      bug('Wrong MVK Faucet address')
      return null
    }

    const mvkTokenBalance = getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: mvkTokenAddress })
    const sMvkTokenBalance = getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: SMVK_TOKEN_ADDRESS })

    if (mvkTokenBalance > 0 || sMvkTokenBalance > 0) {
      bug('You have already claimed MVK', 'You are unable to claim MVK, you have already claimed')
      return null
    }

    return await getMVKTokensFromFaucet(mvkFaucetAddress)
  }, [bug, mvkFaucetAddress, mvkTokenAddress, userAddress, userTokensBalances])

  const contractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: GET_MVK_FROM_FAUCET_ACTION,
      actionFn: requestMVKAction,
    }),
    [requestMVKAction],
  )

  const { action: handleRequestMVK } = useContractAction(contractActionProps)

  const burgerClickHandler = useCallback(() => {
    toggleSidebarCollapsing()
  }, [])

  const sidebarBackdropClickHandler = useCallback(() => {
    toggleSidebarCollapsing(false)
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
              onClick={handleRequestMVK}
              disabled={!canGetInitThouthand || isActionActive}
            >
              {sidebarOpened ? 'MVK Faucet' : 'mvk'}
            </NewButton>
            <a
              // TODO: remove this cond when users will be able to use faucet
              {...(true
                ? {
                    href: '#',
                  }
                : {
                    href: 'https://faucet.marigold.dev/ ',
                    target: '_blank',
                    rel: 'noreferrer',
                  })}
              className={sidebarOpened ? '' : 'small'}
            >
              <NewButton kind={BUTTON_SECONDARY} form={sidebarOpened ? BUTTON_WIDE : BUTTON_ROUND} isThin disabled>
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
