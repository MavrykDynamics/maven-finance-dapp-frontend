import { FetchedTreasuryBalanceType } from "./TypesAndInterfaces/Treasury"

// const network = process.env.REACT_APP_API_NETWORK
export const network = 'ghostnet'

export async function getContractBigmapKeys(contractAddress: string, name: string) {
  return await (
    await fetch(`https://api.${network}.tzkt.io/v1/contracts/${contractAddress}/bigmaps/${name}/keys`)
  ).json()
}

export async function getContractStorage(contractAddress: string) {
  return await (await fetch(`https://api.${network}.tzkt.io/v1/contracts/${contractAddress}/storage`)).json()
}

export async function getChainInfo() {
  return await (await fetch(`https://api.${network}.tzkt.io/v1/head`)).json()
}

export async function getTreasuryAssetsByAddress(treasuryAddress: string): Promise<FetchedTreasuryBalanceType[]> {
  try {
    const fetchedTreasuryAssets = await (
      await fetch(`https://api.${network}.tzkt.io/v1/tokens/balances?account.eq=${treasuryAddress}`)
    ).json()

    const fetchedXtzTreasuryAsset = await (
      await fetch(`https://api.${network}.tzkt.io/v1/accounts/${treasuryAddress}/balance`)
    ).json()

    const xtzAssetObject: FetchedTreasuryBalanceType = {
      account: { address: treasuryAddress },
      balance: fetchedXtzTreasuryAsset,
      token: {
        metadata: { symbol: 'tezos', name: 'XTZ', decimals: '6' },
      },
    }

    return [...fetchedTreasuryAssets].concat(fetchedXtzTreasuryAsset ? [xtzAssetObject] : [])
  } catch (e) {
    console.error('getTreasuryAssetsByAddress error: ', e)
    return []
  }
}
