import { ErrorFooterRight, ErrorFooterWrapper } from '../ErrorPage.style'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { mavrykLinks } from 'app/App.components/Footer/footer.const'
import { ThemeType } from 'consts/theme.const'

type ErrorFooterProps = {
  handleRedirect: () => void
  themeSelected: ThemeType
}

export const ErrorFooter = ({ handleRedirect, themeSelected }: ErrorFooterProps) => {
  return (
    <ErrorFooterWrapper>
      <span onClick={handleRedirect}>
        <ImageWithPlug imageLink={`/images/${themeSelected}/maven-logo-small.svg`} alt="logo-small" />
      </span>

      <ErrorFooterRight>
        {mavrykLinks.map(({ link, title }) => (
          <a key={link} href={link} target="_blank" rel="noreferrer">
            {title}
          </a>
        ))}
      </ErrorFooterRight>
    </ErrorFooterWrapper>
  )
}
