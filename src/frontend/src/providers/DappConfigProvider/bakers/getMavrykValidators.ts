import {convertNumberForClient} from 'utils/calcFunctions'
import {MVRK_DECIMALS} from 'utils/constants'
import {api} from 'utils/api/api'
import {z} from 'zod'

// types
export type MavrykValidatorType = {
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

export const getMavrykValidators = async (): Promise<{
  dao: MavrykValidatorType
  mavrykDynamics: MavrykValidatorType
} | null> => {
  try {
    const mavrykApiBase =
      process.env.REACT_APP_NETWORK === 'atlasnet'
        ? 'https://atlasnet.api.mavryk.network'
        : 'https://api.mavryk.network'

    const [{ data: daoBakerData }, { data: mavrykDynamicsBakerData }] = await Promise.all([
      api<BakeryDelegateDataType>(
        `${mavrykApiBase}/v1/delegates/${DAO_BAKER_STATIC_DATA.address}`,
        {},
        bakeryDelegateDataSchema,
      ),
      api<BakeryDelegateDataType>(
        `${mavrykApiBase}/v1/delegates/${MAVRYK_DYNAMICS_BAKER_STATIC_DATA.address}`,
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
    console.error('getMavrykValidators fetching error:', e)
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

