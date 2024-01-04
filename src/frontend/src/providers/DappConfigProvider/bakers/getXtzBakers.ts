import {convertNumberForClient} from 'utils/calcFunctions'

import BakersMocked from './bakers.json'
import {XTZ_DECIMALS} from 'utils/constants'
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
  return Number(convertNumberForClient({ number: freeSpace, grade: XTZ_DECIMALS }).toFixed(2))
}

// TODO: check why ghostnet tzkt not working for delegates endpoint
export const getXTZBakers = async (): Promise<{
  dao: XtzBakerType
  mavrykDynamics: XtzBakerType
  otherBakers: Array<XtzBakerType>
} | null> => {
  try {
    // TODO: add dynamic fetching
    // const bakers = await fetch('https://api.tezos-nodes.com/v1/bakers')

    const otherBakers = process.env.REACT_APP_NETWORK === 'ghostnet' ? GHOSTNET_BAKERS : BakersMocked

    const [{ data: daoBakerData }, { data: mavrykDynamicsBakerData }] = await Promise.all([
      api<BakeryDelegateDataType>(
        `https://api.tzkt.io/v1/delegates/${DAO_BAKER_STATIC_DATA.address}`,
        {},
        bakeryDelegateDataSchema,
      ),
      api<BakeryDelegateDataType>(
        `https://api.tzkt.io/v1/delegates/${MAVRYK_DYNAMICS_BAKER_STATIC_DATA.address}`,
        {},
        bakeryDelegateDataSchema,
      ),
    ])

    return {
      otherBakers,
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
  isDisabled: process.env.REACT_APP_NETWORK !== 'mainnet',
  logo: 'https://tezos-nodes.com/storage/images/BBOZYYLQpLfTzbXzu0jvk4CublJzMgLM8GNz152M.png',
  name: 'The DAO',
  address: 'tz1ZY5ug2KcAiaVfxhDKtKLx8U5zEgsxgdjV',
  fee: 10,
  yield: 5.5,
  description: `The Maven DAO Bakery belongs to the Maven Finance network. A small portion of the earnings are used to pay for the Decentralized Oracle’s transaction fees. The DAO Bakery is operated by Mavryk Dynamics on behalf of the Maven Finance network.`,
}

const MAVRYK_DYNAMICS_BAKER_STATIC_DATA = {
  isDisabled: process.env.REACT_APP_NETWORK !== 'mainnet',
  logo: 'https://tezos-nodes.com/storage/images/BBOZYYLQpLfTzbXzu0jvk4CublJzMgLM8GNz152M.png',
  name: 'Mavryk Dynamics',
  address: 'tz1NKnczKg77PwF5NxrRohjT5j4PmPXw6hhL',
  fee: 10,
  yield: 5.5,
  description: `The Mavryk Dynamics Bakery belongs to one of the core teams contributing to Maven Finance. Delegating to this Bakery contributes to the further development of Maven Finance.`,
}

const GHOSTNET_BAKERS = [
  {
    logo: 'https://tezos-nodes.com/storage/images/BBOZYYLQpLfTzbXzu0jvk4CublJzMgLM8GNz152M.png',
    name: 'Puss in Boots',
    address: 'tz1bQMn5xYFbX6geRxqvuAiTywsCtNywawxH',
    fee: 0.14,
    yield: 4.91,
    freespace: 115494,
  },
  {
    logo: `${process.env.REACT_APP_TZKT_SERVICE_API}/v1/avatars/tz1eQmVDH438N6WN4CQSWJLVDFqpFfkZvt1R`,
    name: 'Lil Shrek',
    address: 'tz1RuHDSj9P7mNNhfKxsyLGRDahTX5QD1DdP',
    fee: 0.14,
    yield: 4.91,
    freespace: 115494,
  },
  {
    logo: `${process.env.REACT_APP_TZKT_SERVICE_API}/v1/avatars/tz1RuHDSj9P7mNNhfKxsyLGRDahTX5QD1DdP`,
    name: "Shrek's donkey",
    address: 'tz1Qf1pSbJzMN4VtGFfVJRgbXhBksRv36TxW',
    fee: 0.14,
    yield: 4.91,
    freespace: 115494,
  },
]
