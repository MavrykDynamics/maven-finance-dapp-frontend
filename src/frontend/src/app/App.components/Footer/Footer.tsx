import { FooterStyled } from './Footer.styles'
import { mavrykLinks } from './footer.const'

export const Footer = () => {
  return (
    <FooterStyled>
      <div className="powered-by">
        Powered by&nbsp;
        <a href="https://tzkt.io" target="_blank" rel="noreferrer">
          TzKT API
        </a>
        &nbsp; & &nbsp;
        <a href="https://dipdup.io" target="_blank" rel="noreferrer">
          DipDup
        </a>
      </div>

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
