export const normalizeIpfsUrl = (url: string, preferredGateway = 'https://ipfs.io/ipfs/') => {
  const ipfsPathRegex = /(?:ipfs:\/\/|https?:\/\/[^/]*\/ipfs\/)([^/?#]+)/

  const match = url.match(ipfsPathRegex)
  if (match && match[1]) {
    return `${preferredGateway}${match[1]}`
  }

  return url
}

export const isMavrykProductUrl = (url: string) => {
  if (!url || !url.startsWith('https://')) return true // invalid or incomplete = true

  try {
    const parsed = new URL(url)
    const hostname = parsed.hostname

    const allowedHosts = new Set([
      'atlasnet.mavenfinance.io',
      'ghostnet.mavenfinance.io',
      'ghostnet.mavryk.finance',
      'mavryk-finance-dapp-frontend.pages.dev',
    ])

    const isMavryk = allowedHosts.has(hostname) || hostname.endsWith('.mavryk-finance-dapp-frontend.pages.dev')

    return isMavryk || false
  } catch {
    return true // malformed URL = treat as "safe" (true)
  }
}
