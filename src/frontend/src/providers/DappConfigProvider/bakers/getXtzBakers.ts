import {convertNumberForClient} from 'utils/calcFunctions'
import {MVRK_DECIMALS} from 'utils/constants'
import {api} from 'utils/api/api'
import {z} from 'zod'

// types
export type XtzBakerType = {
  logo: string
  name: string
  address: string
  fee: number
  yield: number
  freespace: number
  efficiency?: number
  isDisabled?: boolean
  description?: string
}

const bakeryDelegateDataSchema = z.object({
  balance: z.number(),
  delegatedBalance: z.number(),
})

type BakeryDelegateDataType = z.infer<typeof bakeryDelegateDataSchema>

// helpers
const getFreeSpace = (data: BakeryDelegateDataType) => {
  if (data.balance === -1) return -1

  const freeSpace = data.balance * 9 - data.delegatedBalance
  return Number(convertNumberForClient({ number: freeSpace, grade: MVRK_DECIMALS }).toFixed(2))
}

// TODO: check why ghostnet tzkt not working for delegates endpoint
export const getXTZBakers = async (): Promise<{
  dao: XtzBakerType
  mavrykDynamics: XtzBakerType
  // otherBakers: Array<XtzBakerType>
} | null> => {
  try {
    // TODO: add dynamic fetching for bakers, cuz for now it fetches them from tezos, not mavryk
    // const bakers = await fetch('https://api.tezos-nodes.com/v1/bakers')
    // const otherBakers = process.env.REACT_APP_NETWORK === 'atlasnet' ? GHOSTNET_BAKERS : BakersMocked

    const [{ data: daoBakerData }, { data: mavrykDynamicsBakerData }] = await Promise.all([
      api<BakeryDelegateDataType>(
        `https://api.tzkt.io/v1/delegates/${DAO_BAKER_STATIC_DATA.address}`,
        {},
        bakeryDelegateDataSchema,
      ),
      api<BakeryDelegateDataType>(
        `https://atlasnet.api.mavryk.network/v1/delegates/${MAVRYK_DYNAMICS_BAKER_STATIC_DATA.address}`,
        {},
        bakeryDelegateDataSchema,
      ),
    ])

    // TODO For now there is only one baker Mavryk Dynamics
    // add others when the api will be ready
    return {
      dao: {
        ...DAO_BAKER_STATIC_DATA,
        freespace: getFreeSpace(daoBakerData),
      },
      mavrykDynamics: {
        ...MAVRYK_DYNAMICS_BAKER_STATIC_DATA,
        freespace: getFreeSpace(mavrykDynamicsBakerData),
      },
    }
  } catch (e) {
    console.log('getXTZBakers fething error', e)
    return null
  }
}

const DAO_BAKER_STATIC_DATA = {
  isDisabled: true,
  logo: 'https://tezos-nodes.com/storage/images/BBOZYYLQpLfTzbXzu0jvk4CublJzMgLM8GNz152M.png',
  name: 'The DAO',
  address: 'tz1ZY5ug2KcAiaVfxhDKtKLx8U5zEgsxgdjV',
  fee: 2,
  yield: 5.5,
  description: `The Maven DAO Validator belongs to the Maven Finance network. A small portion of the earnings are used to pay for the Decentralized Oracle’s transaction fees. The DAO Validator is operated by Mavryk Dynamics on behalf of the Maven Finance network.`,
}

const MAVRYK_DYNAMICS_BAKER_STATIC_DATA = {
  isDisabled: process.env.REACT_APP_NETWORK !== 'atlasnet',
  logo: 'https://tezos-nodes.com/storage/images/BBOZYYLQpLfTzbXzu0jvk4CublJzMgLM8GNz152M.png',
  name: 'Mavryk Dynamics',
  address: 'mv1V4h45W3p4e1sjSBvRkK2uYbvkTnSuHg8g',
  fee: 2,
  yield: 5.5,
  description: `The Mavryk Dynamics Validator belongs to one of the core teams contributing to Maven Finance. Delegating to this Validator contributes to the further development of Maven Finance.`,
}

const GHOSTNET_BAKERS: unknown[] = [
  // {
  //   logo: 'https://tezos-nodes.com/storage/images/BBOZYYLQpLfTzbXzu0jvk4CublJzMgLM8GNz152M.png',
  //   name: 'Puss in Boots',
  //   address: 'tz1bQMn5xYFbX6geRxqvuAiTywsCtNywawxH',
  //   fee: 0.14,
  //   yield: 4.91,
  //   freespace: 115494,
  // },
  // {
  //   logo: `${process.env.REACT_APP_TZKT_SERVICE_API}/v1/avatars/tz1eQmVDH438N6WN4CQSWJLVDFqpFfkZvt1R`,
  //   name: 'Lil Shrek',
  //   address: 'tz1RuHDSj9P7mNNhfKxsyLGRDahTX5QD1DdP',
  //   fee: 0.14,
  //   yield: 4.91,
  //   freespace: 115494,
  // },
  // {
  //   logo: `${process.env.REACT_APP_TZKT_SERVICE_API}/v1/avatars/tz1RuHDSj9P7mNNhfKxsyLGRDahTX5QD1DdP`,
  //   name: "Shrek's donkey",
  //   address: 'tz1Qf1pSbJzMN4VtGFfVJRgbXhBksRv36TxW',
  //   fee: 0.14,
  //   yield: 4.91,
  //   freespace: 115494,
  // },
]
