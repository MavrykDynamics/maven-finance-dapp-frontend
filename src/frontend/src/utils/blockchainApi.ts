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
