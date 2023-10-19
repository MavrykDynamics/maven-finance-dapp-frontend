import { gql } from 'utils/__generated__'

export const DAPP_INITIAL_CONFIG_QUERY = gql(`
	query initialDappQuery {
		# max lengths for inputs
		council: council {
      council_member_image_max_length
      council_member_name_max_length
      council_member_website_max_length
      request_purpose_max_length
      request_token_name_max_length
    }

    governance: governance {
      proposal_description_max_length
      proposal_invoice_max_length
      proposal_metadata_title_max_length
      proposal_source_code_max_length
      proposal_title_max_length
    }

    emergency_governance: emergency_governance {
      proposal_desc_max_length
      proposal_title_max_length
    }

    governance_satellite: governance_satellite {
      gov_purpose_max_length
    }
    
    delegation: delegation {
      satellite_description_max_length
      satellite_name_max_length
      satellite_website_max_length

			# min amount of smvk to become a satellite
			minimum_smvk_balance
    }

		# mvk faucet address
		mvk_faucet: mvk_faucet{
			address
		}

    # dapp indexed lvl
    dipdup_index: dipdup_index(where: {name: {_eq: "mavryk_finance"}}) {
			level
		}
	}
`)
