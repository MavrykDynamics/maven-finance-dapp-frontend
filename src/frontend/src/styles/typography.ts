import { css } from 'styled-components'

/**
 * Typography token system for Maven Finance.
 *
 * Replaces the ad-hoc collection of literal font-size / font-weight / line-height
 * values scattered across 99 style files. Use these tokens instead of literals
 * so visual hierarchy stays consistent and changes can be made in one place.
 *
 * Usage:
 *   import { FontSize, FontWeight, TypePresets } from 'styles'
 *
 *   const Title = styled.h2`
 *     ${TypePresets.h2}
 *     color: ${({ theme }) => theme.mainHeadingText};
 *   `
 *
 *   const Label = styled.span`
 *     font-size: ${FontSize.sm};
 *     font-weight: ${FontWeight.medium};
 *   `
 *
 *   const Stat = styled.div`
 *     ${TypePresets.stat}
 *   `
 */

export const FontSize = {
  xxs: '10px', // micro labels — chart axes, badges, helper text in tight spaces
  xs: '11px', // tiny labels, helper text
  sm: '12px', // captions, small labels
  base: '14px', // body — most-used size, default
  md: '16px', // emphasized body, button text
  lg: '18px', // small headings, card titles
  xl2: '20px', // subheading (Apple HIG title3) — bridges lg→xl
  xl: '22px', // section headings (h2)
  xl3: '24px', // page-section heading — bridges xl→2xl (replaces 25px stragglers)
  '2xl': '30px', // large page headings (h1)
  '3xl': '40px', // hero — reserved
} as const

export const FontWeight = {
  regular: 400, // body default — explicit, replaces de facto 600 inheritance
  medium: 500,
  semibold: 600, // headings, emphasis
  bold: 700, // page titles
} as const

export const LineHeight = {
  tight: 1.2, // headings
  normal: 1.5, // body
  relaxed: 1.7, // long-form
} as const

/**
 * Px-based line-heights for contexts where unitless multipliers don't fit
 * (e.g. multi-line inputs aligned to a fixed grid).
 */
export const LineHeightPx = {
  body: '21px', // 14px × 1.5
  heading: '24px',
  large: '28px',
} as const

/**
 * Letter-spacing scale. Currently unused — reserved for forthcoming work
 * (caps labels, tabular numbers, fine-tuned headings).
 */
export const LetterSpacing = {
  tight: '-0.02em',
  normal: '0',
  wide: '0.04em',
  caps: '0.08em', // ALL-CAPS labels only — WCAG-safe (<0.12em)
} as const

/**
 * Composable css blocks for common typographic patterns.
 *
 * Note: NOT marked `as const` — `css` returns FlattenSimpleInterpolation,
 * which doesn't propagate through literal-type narrowing. Marking the wrapping
 * object `as const` would be misleading without giving any safety.
 */
export const TypePresets = {
  body: css`
    font-size: ${FontSize.base};
    font-weight: ${FontWeight.regular};
    line-height: ${LineHeight.normal};
  `,
  caption: css`
    font-size: ${FontSize.sm};
    font-weight: ${FontWeight.regular};
    line-height: ${LineHeight.normal};
  `,
  emphasis: css`
    font-size: ${FontSize.base};
    font-weight: ${FontWeight.semibold};
    line-height: ${LineHeight.normal};
  `,
  h1: css`
    font-size: ${FontSize['2xl']};
    font-weight: ${FontWeight.bold};
    line-height: ${LineHeight.tight};
  `,
  h2: css`
    font-size: ${FontSize.xl};
    font-weight: ${FontWeight.semibold};
    line-height: ${LineHeight.tight};
  `,
  h3: css`
    font-size: ${FontSize.lg};
    font-weight: ${FontWeight.semibold};
    line-height: ${LineHeight.tight};
  `,
  h4: css`
    font-size: ${FontSize.md};
    font-weight: ${FontWeight.semibold};
    line-height: ${LineHeight.normal};
  `,

  // Domain presets — capture repeating composite patterns

  button: css`
    font-size: ${FontSize.md};
    font-weight: ${FontWeight.semibold};
    line-height: ${LineHeight.tight};
  `,
  label: css`
    font-size: ${FontSize.sm};
    font-weight: ${FontWeight.medium};
    line-height: ${LineHeight.normal};
  `,
  stat: css`
    font-size: ${FontSize.xl};
    font-weight: ${FontWeight.semibold};
    line-height: ${LineHeight.tight};
  `,
  statSmall: css`
    font-size: ${FontSize.lg};
    font-weight: ${FontWeight.semibold};
    line-height: ${LineHeight.tight};
  `,
  code: css`
    font-family: 'SF Mono', 'SFMono-Regular', 'Consolas', 'Liberation Mono', Menlo, Courier, monospace;
    font-size: ${FontSize.sm};
    font-weight: ${FontWeight.regular};
    line-height: ${LineHeight.normal};
  `,
  /** Body text with tabular numerals — columns of digits align consistently. */
  tabular: css`
    font-size: ${FontSize.base};
    font-weight: ${FontWeight.regular};
    line-height: ${LineHeight.normal};
    font-variant-numeric: tabular-nums;
  `,
}
