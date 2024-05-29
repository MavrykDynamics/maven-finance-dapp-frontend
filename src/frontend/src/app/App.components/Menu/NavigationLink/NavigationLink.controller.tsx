import React, { useEffect, useMemo, useState } from 'react'
import useCollapse from 'react-collapsed'
import { Link, matchPath, useLocation } from 'react-router-dom'

// types
import { SubNavigationRoute } from '../../../../utils/TypesAndInterfaces/Navigation'

// styles
import {
  NavigationLinkContainer,
  NavigationLinkIcon,
  NavigationLinkItem,
  NavigationSubLinks,
  SubLinkText,
  SubNavLink,
} from './NavigationLink.style'

// costants
import { checkIfLinkSelected, isSubLinkShown } from './NavigationLink.constants'

// view
import Icon from 'app/App.components/Icon/Icon.view'
import { useUserContext } from 'providers/UserProvider/user.provider'

const Sublink = ({ subNavLink, isSelected }: { subNavLink: SubNavigationRoute; isSelected: boolean }) => (
  <SubNavLink $disabled={subNavLink.disabled}>
    <Link to={`/${subNavLink.subPath}`} className={subNavLink.disabled ? 'disabled' : ''}>
      <SubLinkText $selected={isSelected}>{subNavLink.subTitle}</SubLinkText>
    </Link>
  </SubNavLink>
)

type NavigationLinkProps = {
  title: string
  id: number
  path: string
  icon?: string
  subPages?: SubNavigationRoute[]
  selectedMainLink: number
  isMobMenuExpanded: boolean
  disabled?: boolean
  navLinkClickHandler: () => void
}

export const NavigationLink = ({
  title,
  id,
  path,
  icon,
  subPages = [],
  selectedMainLink,
  isMobMenuExpanded,
  disabled,
  navLinkClickHandler,
}: NavigationLinkProps) => {
  const { pathname } = useLocation()

  const { userAddress, isSatellite } = useUserContext()

  const [showSubPages, setShowSubPages] = useState<boolean>(false)

  const isMainLinkDisabled = useMemo(() => {
    const paths = subPages.reduce((acc, { routeSubPath }) => acc.concat(routeSubPath), [`/${path}`])
    return paths.find((path) => matchPath({ path }, pathname))
  }, [pathname])

  useEffect(() => {
    const newStatusToShowSubPages = isMobMenuExpanded ? id === selectedMainLink : false

    if (showSubPages !== newStatusToShowSubPages) {
      setShowSubPages(newStatusToShowSubPages)
    }
  }, [id, isMobMenuExpanded, selectedMainLink, showSubPages])

  const { getCollapseProps, getToggleProps } = useCollapse({ isExpanded: showSubPages })

  const mainLink = (
    <Link
      className={`${disabled ? 'disabled' : ''}`}
      to={`/${path}`}
      onClick={(e: React.MouseEvent | React.TouchEvent) => isMainLinkDisabled && e.preventDefault()}
    >
      {icon && (
        <NavigationLinkIcon $selected={selectedMainLink === id} className="navLinkIcon">
          <Icon id={icon} />
        </NavigationLinkIcon>
      )}
      <div className="navLinkTitle">{title}</div>
    </Link>
  )

  if (subPages) {
    return (
      <NavigationLinkContainer
        className={`collapsible`}
        $selected={selectedMainLink === id}
        $isMobMenuExpanded={isMobMenuExpanded}
        key={id}
      >
        <NavigationLinkItem
          $selected={selectedMainLink === id}
          $isMobMenuExpanded={isMobMenuExpanded}
          $disabled={disabled}
          className="header"
          {...getToggleProps({ onClick: () => (!disabled ? setShowSubPages(!showSubPages) : null) })}
          onClick={navLinkClickHandler}
        >
          {mainLink}
        </NavigationLinkItem>
        {showSubPages && (
          <div {...getCollapseProps()}>
            <NavigationSubLinks className="content">
              {subPages.map((subNavLink: SubNavigationRoute) => {
                const selectedSubLink = checkIfLinkSelected(pathname, subNavLink.routeSubPath)
                const showSublink = isSubLinkShown(subNavLink, isSatellite, userAddress)

                return showSublink ? (
                  <Sublink key={subNavLink.id} subNavLink={subNavLink} isSelected={selectedSubLink} />
                ) : null
              })}
            </NavigationSubLinks>
          </div>
        )}
      </NavigationLinkContainer>
    )
  }

  return (
    <NavigationLinkContainer key={id} $selected={selectedMainLink === id} $isMobMenuExpanded={isMobMenuExpanded}>
      <NavigationLinkItem
        onClick={navLinkClickHandler}
        $selected={selectedMainLink === id}
        $isMobMenuExpanded={isMobMenuExpanded}
        $disabled={disabled}
      >
        {mainLink}
      </NavigationLinkItem>
    </NavigationLinkContainer>
  )
}
