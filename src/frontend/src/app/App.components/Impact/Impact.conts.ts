export const NEGATIVE_IMPACT = 'negative'
export const POSITIVE_IMPACT = 'positive'
export const NEUTRAL_IMPACT = 'neutral'
export type ImpactValueType = typeof NEGATIVE_IMPACT | typeof POSITIVE_IMPACT | typeof NEUTRAL_IMPACT

export const ImpactSignMapper = {
  '+': POSITIVE_IMPACT,
  '-': NEGATIVE_IMPACT,
  '': NEUTRAL_IMPACT,
} as const
