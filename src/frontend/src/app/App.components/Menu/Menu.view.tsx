import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'

// view
import Icon from '../Icon/Icon.view'
import { MenuTopBar } from './MenuTopBar/MenuTopBar.controller'
import { NavigationLink } from './NavigationLink/NavigationLink.controller'
import NewButton from '../Button/NewButton'
import CustomLink from '../CustomLink/CustomLink'

// types
import { MainNavigationRoute } from '../../../utils/TypesAndInterfaces/Navigation'

// styles
import { MenuFooter, MenuGrid, MenuSidebarContent, MenuSidebarStyled } from './Menu.style'

// helpers, constants
import { mainNavigationLinks } from './NavigationLink/MainNavigationLinks'
import { checkIfLinkSelected } from './NavigationLink/NavigationLink.constants'
import { BUTTON_PRIMARY, BUTTON_ROUND, BUTTON_SECONDARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { SMVN_TOKEN_ADDRESS } from 'utils/constants'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { getUserTokenBalanceByAddress } from 'providers/UserProvider/helpers/userBalances.helpers'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { LinkWide, LinkWrapper } from '../CustomLink/CustomLink.const'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { getMVNTokensFromFaucet, getUSDtTokensFromFaucet } from 'providers/UserProvider/actions/user.actions'
import { GET_MVN_FROM_FAUCET_ACTION, GET_USDT_FROM_FAUCET_ACTION } from 'providers/UserProvider/helpers/user.consts'

// hooks
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'

type MenuViewProps = {
  openChangeNodePopupHandler: () => void
}

export const SocialIcons = () => (
  <div className="social-wrapper">
    <a href="https://twitter.com/MavenFinanceDAO" target="_blank" rel="noreferrer">
      <Icon id="socialTwitter" />
    </a>
    <a href="https://t.me/MavenFinance" target="_blank" rel="noreferrer">
      <Icon id="socialTelegram" />
    </a>
    {/* // TODO: delete after approval  */}
    {/* <a href="https://blog.mavenfinance.io/" target="_blank" rel="noreferrer">
      <Icon id="socialMedium" />
    </a> */}
    <a href="https://linkedin.com/company/mavryk-finance" target="_blank" rel="noreferrer">
      <Icon id="socialLinkedin" />
    </a>
    <a href="https://discord.com/invite/7VXPR4gkT6" target="_blank" rel="noreferrer">
      <Icon id="socialDiscord" />
    </a>
    <a href="https://docs.mavenfinance.io" target="_blank" rel="noreferrer">
      <Icon id="faqIcon" />
    </a>
    <a href="https://github.com/mavenfinance" target="_blank" rel="noreferrer">
      <Icon id="socialGitHub" />
    </a>
  </div>
)

export const MenuView = ({ openChangeNodePopupHandler }: MenuViewProps) => {
  const { bug } = useToasterContext()
  const {
    mvnFaucetAddress,
    toggleSidebarCollapsing,
    contractAddresses: { mvnTokenAddress },
    preferences: { sidebarOpened },
    globalLoadingState: { isActionActive },
  } = useDappConfigContext()
  const { userTokensBalances } = useUserContext()
  const { userAddress, isSatellite } = useUserContext()

  const { pathname } = useLocation()
  const [canGetInitThouthand, setCanGetInitThouthand] = useState(false)

  const usdtAddress = 'KT1StUZzJ34MhSNjkQMSyvZVrR9ppkHMFdFf'
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
          (getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: mvnTokenAddress }) === 0 ||
            getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: SMVN_TOKEN_ADDRESS }) === 0),
      ),
    )
  }, [userAddress, mvnTokenAddress, userTokensBalances])

  const [selectedMainLink, setSelectedMainLink] = useState<number>(0)

  // requestMVN action  ----------------------
  const requestMVNAction = useCallback(async () => {
    if (!userAddress) {
      bug('Click Connect in the left menu', 'Please connect your wallet')
      return null
    }

    if (!mvnFaucetAddress) {
      bug('Wrong MVN Faucet address')
      return null
    }

    const mvnTokenBalance = getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: mvnTokenAddress })
    const sMvnTokenBalance = getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: SMVN_TOKEN_ADDRESS })

    if (mvnTokenBalance > 0 || sMvnTokenBalance > 0) {
      bug('You have already claimed MVN', 'You are unable to claim MVN')
      return null
    }

    return await getMVNTokensFromFaucet(mvnFaucetAddress)
  }, [bug, mvnFaucetAddress, mvnTokenAddress, userAddress, userTokensBalances])

  const contractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: GET_MVN_FROM_FAUCET_ACTION,
      actionFn: requestMVNAction,
    }),
    [requestMVNAction],
  )

  const { action: handleRequestMVN } = useContractAction(contractActionProps)

  const requestUSDtAction = useCallback(async () => {
    if (!userAddress) {
      bug('Click Connect in the left menu', 'Please connect your wallet')
      return null
    }

    if (!mvnFaucetAddress) {
      bug('Wrong USDt Faucet address')
      return null
    }

    const usdtTokenBalance = getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: usdtAddress })

    if (usdtTokenBalance > 0) {
      bug('You have already claimed USDt', 'You are unable to claim USDt')
      return null
    }

    return await getUSDtTokensFromFaucet(mvnFaucetAddress)
  }, [bug, mvnFaucetAddress, usdtAddress, userAddress, userTokensBalances])

  const usdtContractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: GET_USDT_FROM_FAUCET_ACTION,
      actionFn: requestUSDtAction,
    }),
    [requestMVNAction],
  )

  const { action: handleRequestUSDT } = useContractAction(usdtContractActionProps)

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

  const year = useMemo(() => new Date().getFullYear(), [])

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
            {/* <NewButton
              kind={BUTTON_PRIMARY}
              form={sidebarOpened ? BUTTON_WIDE : BUTTON_ROUND}
              isThin
              onClick={handleRequestMVN}
              disabled={!canGetInitThouthand || isActionActive}
            >
              {sidebarOpened ? 'MVN Faucet' : 'MVN'}
            </NewButton>
            <NewButton
              kind={BUTTON_SECONDARY}
              form={sidebarOpened ? BUTTON_WIDE : BUTTON_ROUND}
              isThin
              onClick={handleRequestUSDT}
              disabled={!canGetInitThouthand || isActionActive}
            >
              {sidebarOpened ? 'USDt Faucet' : 'USD'}
            </NewButton> */}
            {/*<CustomLink to="https://faucet.marigold.dev/" kind={sidebarOpened ? LinkWide : LinkWrapper}>*/}
            {/*  <NewButton kind={BUTTON_SECONDARY} form={sidebarOpened ? BUTTON_WIDE : BUTTON_ROUND} isThin>*/}
            {/*    {sidebarOpened ? ' Ghostnet Faucet' : 'GF'}*/}
            {/*  </NewButton>*/}
            {/*</CustomLink>*/}

            <CustomLink to="https://forms.gle/bwmTfpoLKBhaf7yD" kind={sidebarOpened ? LinkWide : LinkWrapper}>
              <NewButton kind={BUTTON_SECONDARY} form={sidebarOpened ? BUTTON_WIDE : BUTTON_ROUND} isThin>
                {sidebarOpened ? 'Submit Feedback' : 'SF'}
              </NewButton>
            </CustomLink>

            <SocialIcons />
            <span>
              DAPP v2.0
              <br />© Maven Finance {year}
            </span>
          </MenuFooter>
        </MenuSidebarContent>
      </MenuSidebarStyled>
    </>
  )
}
