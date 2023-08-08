import { z } from 'zod'

export const indexerLevelSchema = z.array(z.object({ level: z.number() }))

export const dappConfigSchema = z.object({
  council: z.array(
    z.object({
      council_member_image_max_length: z.number(),
      council_member_name_max_length: z.number(),
      council_member_website_max_length: z.number(),
      request_purpose_max_length: z.number(),
      request_token_name_max_length: z.number(),
    }),
  ),
  governance: z.array(
    z.object({
      proposal_description_max_length: z.number(),
      proposal_invoice_max_length: z.number(),
      proposal_metadata_title_max_length: z.number(),
      proposal_source_code_max_length: z.number(),
      proposal_title_max_length: z.number(),
    }),
  ),
  emergency_governance: z.array(
    z.object({
      proposal_desc_max_length: z.number(),
      proposal_title_max_length: z.number(),
    }),
  ),
  governance_satellite: z.array(
    z.object({
      gov_purpose_max_length: z.number(),
    }),
  ),
  delegation: z.array(
    z.object({
      satellite_description_max_length: z.number(),
      satellite_name_max_length: z.number(),
      satellite_website_max_length: z.number(),
      minimum_smvk_balance: z.number(),
    }),
  ),
  mvk_faucet: z.array(
    z.object({
      address: z.string(),
    }),
  ),
})

export type DappConfigGqlType = z.infer<typeof dappConfigSchema>
