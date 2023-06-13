import { gql } from 'utils/__generated__'

export const GET_MAX_LENGTHS_QUERY = gql(`
query getMaxlenghtsQuery {
    council {
      council_member_image_max_length
      council_member_name_max_length
      council_member_website_max_length
      request_purpose_max_length
      request_token_name_max_length
    }
    governance {
      proposal_description_max_length
      proposal_invoice_max_length
      proposal_metadata_title_max_length
      proposal_source_code_max_length
      proposal_title_max_length
    }
    emergency_governance {
      proposal_desc_max_length
      proposal_title_max_length
    }
    governance_satellite {
      gov_purpose_max_length
    }
    delegation {
      satellite_description_max_length
      satellite_name_max_length
      satellite_website_max_length
    }
  }
  
`)
