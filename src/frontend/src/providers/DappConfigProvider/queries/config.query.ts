import { gql } from 'utils/__generated__'

export const GET_MVK_FAUCET_QUERY = gql(`
	query MVKFaucet {
		mvk_faucet{
			address
		}
	}
`)

export const GET_SATELLITE_MIN_STAKED_AMOUNT_QUERY = gql(`
	query satelliteMinStakedAmount {
		delegation {
			minimum_smvk_balance
		}
	}
`)
