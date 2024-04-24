import { useState } from 'react'

// view
import { MobileWalletDetails } from 'app/App.components/ConnectWallet/ConnectedWalletInfo'
import { SocialIcons } from '../../Menu.view'
import { MobileTopBarStyled } from '../MenuTopBar.style'
import { TopBarLinks } from './TopBarLinks.controller'
import ConnectWalletBtn from 'app/App.components/ConnectWallet/ConnectWalletBtn'

// consts
import { ABOUT_LINKS, BLOG_LINKS, DOCS_LINKS, PRODUCTS_LINKS } from '../MenuTopBar.controller'

// hooks
import { useUserContext } from 'providers/UserProvider/user.provider'

export const MobileTopBar = ({
  show,
  closeMobileMenu,
  mountWertWiget,
}: {
  show: boolean
  closeMobileMenu: () => void
  mountWertWiget: (commodity: string) => void
}) => {
  const { userAddress } = useUserContext()

  const [selectedLinksBlock, setSelectedLinksBlock] = useState<null | string>(null)
  return (
    <MobileTopBarStyled $show={show}>
      {userAddress ? (
        <MobileWalletDetails mountWertWiget={mountWertWiget} closeMobileMenu={closeMobileMenu} />
      ) : (
        <div className="connect-wallet">
          <ConnectWalletBtn />
        </div>
      )}

      <div className="container">
        <TopBarLinks
          groupName={'Products'}
          groupLinks={PRODUCTS_LINKS}
          useClickOpening
          selectedLinksBlock={selectedLinksBlock}
          setSelectedLinksBlock={() => {
            setSelectedLinksBlock(selectedLinksBlock === 'Products' ? null : 'Products')
          }}
        />
        <TopBarLinks
          groupName={'About'}
          groupLinks={ABOUT_LINKS}
          useClickOpening
          selectedLinksBlock={selectedLinksBlock}
          setSelectedLinksBlock={() => {
            setSelectedLinksBlock(selectedLinksBlock === 'About' ? null : 'About')
          }}
        />
        <TopBarLinks groupName={'Blog 🔥'} groupLinks={BLOG_LINKS} useClickOpening />
        <TopBarLinks
          groupName={'Docs'}
          groupLinks={DOCS_LINKS}
          useClickOpening
          selectedLinksBlock={selectedLinksBlock}
          setSelectedLinksBlock={() => {
            setSelectedLinksBlock(selectedLinksBlock === 'Docs' ? null : 'Docs')
          }}
        />

        <SocialIcons />
      </div>
    </MobileTopBarStyled>
  )
}
