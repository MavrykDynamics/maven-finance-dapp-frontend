export const toCamelCase = (str: string) => {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => {
    if (Number(match) === 0) return ''
    return index === 0 ? match.toLowerCase() : match.toUpperCase()
  })
}
