export const normalizeIpfsUrl = (url: string, preferredGateway = 'https://ipfs.io/ipfs/') => {
  const ipfsPathRegex = /(?:ipfs:\/\/|https?:\/\/[^/]*\/ipfs\/)([^/?#]+)/

  const match = url.match(ipfsPathRegex)
  if (match && match[1]) {
    return `${preferredGateway}${match[1]}`
  }

  return url
}
