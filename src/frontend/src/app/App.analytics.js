export const loadGTag = () => {
  if (process.env.NODE_ENV === 'production') {
    const id = 'GTM-N2535QW'

    // Load script into <head>
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' })

    const script = document.createElement('script')
    script.id = 'gtm-script'
    script.async = true
    script.src = `https://www.googletagmanager.com/gtm.js?id=${id}`

    const firstScript = document.getElementsByTagName('script')[0]
    firstScript.parentNode.insertBefore(script, firstScript)

    // Inject iframe into <body>
    const gtmIframe = document.createElement('iframe')
    gtmIframe.id = 'gtag-iframe'
    gtmIframe.src = `https://www.googletagmanager.com/ns.html?id=${id}`
    gtmIframe.height = '0'
    gtmIframe.width = '0'
    gtmIframe.style.display = 'none'
    gtmIframe.style.visibility = 'hidden'

    document.body.appendChild(gtmIframe)
  }
}
