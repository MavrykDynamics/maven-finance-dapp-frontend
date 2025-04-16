export function buildCollateralQuery(tokenAddresses: string[]) {
  if (!tokenAddresses.length) {
    return `  query GetCollateralPerToken {
        __typename
      }`
  }
  const fields = tokenAddresses
    .map((address, i) => {
      const alias = `${address}`
      return `
          ${alias}: vault_collateral_view_aggregate(
            where: { token_address: { _eq: "${address}" } }, limit: 1000
          ) {
            aggregate {
              sum {
                balance
              }
            }
          }
        `
    })
    .join('\n')

  return `
      query GetCollateralPerToken {
        ${fields}
      }
    `
}
