// view
import ConnectWalletBanner from '../ConnectWallet/ConnectWalletBanner'
import { ImageWithPlug } from '../Icon/ImageWithPlug'

// style
import {
  PageHeaderForegroundImage,
  PageHeaderForegroundImageContainer,
  PageHeaderStyled,
  PageHeaderTextArea,
} from './PageHeader.style'

type PageHeaderViewProps = {
  page: string
  title: string
  subText: string
  backgroundImageSrc?: string
  foregroundImageSrc?: string
  avatar?: string | null
}

export const PageHeaderView = ({
  page,
  title,
  subText,
  foregroundImageSrc,
  backgroundImageSrc,
  avatar,
}: PageHeaderViewProps) => {
  return (
    <>
      <PageHeaderStyled $backgroundImageSrc={backgroundImageSrc ?? ''}>
        <PageHeaderTextArea>
          <h1>
            {title}
            {avatar && <ImageWithPlug useRounded alt={title} imageLink={avatar} plugSrc="/images/default-user.png" />}
          </h1>
          <p>{subText}</p>
        </PageHeaderTextArea>
        <PageHeaderForegroundImageContainer>
          <PageHeaderForegroundImage $page={page} src={foregroundImageSrc ?? '/images/portal.svg'} alt="portal" />
        </PageHeaderForegroundImageContainer>
      </PageHeaderStyled>
      <ConnectWalletBanner />
    </>
  )
}
