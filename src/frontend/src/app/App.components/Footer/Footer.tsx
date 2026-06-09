import { FooterStyled } from './Footer.styles'
import { mavrykLinks } from './footer.const'

export const Footer = () => {
  return (
    <FooterStyled>
      <div className="additional-links">
        {mavrykLinks.map(({ link, title }) => (
          <a key={link} href={link} target="_blank" rel="noreferrer">
            {title}
          </a>
        ))}
      </div>
    </FooterStyled>
  )
}
