import { FooterStyled } from './Footer.styles'

export const Footer = () => {
  return (
    <FooterStyled>
      <div className="powered-by">
        Powered by &nbsp;
        <a href="https://tzkt.io" target="_blank" rel="noreferrer">
          TzKT API
        </a>
        &nbsp; & &nbsp;
        <a href="https://dipdup.io" target="_blank" rel="noreferrer">
          DipDup
        </a>
      </div>

      <div className="additional-links">
        <a
          href="https://docs.google.com/document/d/1jW-XtRPv3TsCV2meV2ajgkQ6dI0iEwuz9xgZwnyMliw/edit"
          target="_blank"
          rel="noreferrer"
        >
          Privacy Policy
        </a>
        &nbsp;
        <a
          href="https://docs.google.com/document/d/1R0LA7CmVQjH7vr-FvWOy96LRxJ_XU3HXLXnqNZjZlJQ/edit"
          target="_blank"
          rel="noreferrer"
        >
          Terms of Use
        </a>
      </div>
    </FooterStyled>
  )
}
