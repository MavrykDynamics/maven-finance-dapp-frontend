export const getShortTzAddress = ({
  tzAddress,
  amountFromStart = 4,
  amountFromEnd = 4,
}: {
  tzAddress: string
  amountFromStart?: number
  amountFromEnd?: number
}): string =>
  `${tzAddress.slice(0, amountFromStart)}...${tzAddress.slice(tzAddress.length - amountFromEnd, tzAddress.length)}`
