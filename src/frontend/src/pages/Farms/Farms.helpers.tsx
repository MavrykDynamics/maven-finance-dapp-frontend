// export const getLPTokensInfo = async (farmList: FarmGraphQL[]) => {
//     return await Promise.all(
//       farmList.map(async ({ address }) => {
//         const lpTokenInfo = await getFarmMetadata(address)
//         const parsedLpTokenInfo = typeof lpTokenInfo === 'string' ? JSON.parse(lpTokenInfo) : lpTokenInfo

//         const lpTokenUserBalance =
//           typeof parsedLpTokenInfo === 'object'
//             ? Number(await getUserBalanceByAddressOld(parsedLpTokenInfo?.liquidityPairToken?.tokenAddress?.[0]))
//             : 0
//         return {
//           lpTokenInfo: parsedLpTokenInfo,
//           lpTokenUserBalance: lpTokenUserBalance,
//         }
//       }),
//     )
// }

// get user tokens balance
export const getUserBalanceByAddressOld = async (tokenAddress?: string) => {
  if (!tokenAddress) return 0

  return await (await fetch(`https://api.ghostnet.tzkt.io/v1/accounts/${tokenAddress}/balance`)).json()
}
