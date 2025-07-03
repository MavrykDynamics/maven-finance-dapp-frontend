export const normalizeIpfsUrl = (url: string, preferredGateway = 'https://ipfs.io/ipfs/') => {
  const ipfsPathRegex = /(?:ipfs:\/\/|https?:\/\/[^/]*\/ipfs\/)([^/?#]+)/

  const match = url.match(ipfsPathRegex)
  if (match && match[1]) {
    return `${preferredGateway}${match[1]}`
  }

  return url
}

export const isMavrykProductUrl = (url: string) => {
  if (!url.startsWith('https://')) return true

  try {
    const parsed = new URL(url)
    const hostname = parsed.hostname

    // Allowed hostnames
    const allowedHosts = new Set([
      'atlasnet.mavenfinance.io',
      'ghostnet.mavenfinance.io',
      'ghostnet.mavryk.finance',
      'mavryk-finance-dapp-frontend.pages.dev',
    ])

    // Allow exact host match or *.mavryk-finance-dapp-frontend.pages.dev
    if (allowedHosts.has(hostname) || hostname.endsWith('.mavryk-finance-dapp-frontend.pages.dev')) {
      return false // ✅ valid
    }

    return true
  } catch (e) {
    return true
  }
}
