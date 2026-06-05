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
 */

export const FontSize = {
  xs: '11px', // tiny labels, helper text
  sm: '12px', // captions, small labels
  base: '14px', // body — most-used size, default
  md: '16px', // emphasized body, button text
  lg: '18px', // small headings, card titles
  xl: '22px', // section headings (h2)
  '2xl': '30px', // large page headings (rare)
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
    font-size: ${FontSize['3xl']};
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
}
