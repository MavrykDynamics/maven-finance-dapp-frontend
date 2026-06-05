/**
 * Maven Finance theme — strict color/style key contract.
 *
 * Replaces the previous `Record<string, string>` that allowed any key,
 * hiding typos and missing-key bugs. All 57 keys are required and
 * shared across the three theme palettes (dark / light / space) in
 * `colors.ts`.
 *
 * Values are CSS-string-compatible: solid colors, rgba, gradients,
 * or shorthand strings (e.g. linear-gradient(...), animation gradients).
 */
export interface MavenTheme {
  // Primary colors
  selectedColor: string
  selectedColorSecondary: string
  linksAndButtons: string
  backgroundColor: string
  cards: string
  mainHeadingText: string
  subHeadingText: string
  primaryText: string
  menuButtonText: string
  menuButtonSelected: string
  placeholders: string
  regularText: string
  strokeColor: string
  divider: string
  messagesBackground: string
  tooltipTextBg: string
  strokeCards: string
  footerColor: string
  strokeForForms: string

  // Secondary status colors
  infoColor: string
  upColor: string
  downColor: string
  neutralColor: string
  neutralSecondaryColor: string
  warningColor: string
  riskColor: string

  // Background secondary (translucent status fills)
  upBgColor: string
  downBgColor: string
  neutralBgColor: string

  // Specific accents
  coralColor: string
  inputFocusColor: string
  ipfsBorderColor: string
  ipfsHoverBorderColor: string
  menuBackdropColor: string
  menuBackgroundActiveColor: string
  popupBackdropColor: string
  pageHeaderColor: string
  scrollBlockColor: string
  cardHoverColor: string
  rpcNodeSelecledColor: string
  roiCalculatorBackground: string
  dashboardTvlBackground: string

  // Charts
  primaryChartColor: string
  primaryChartTopColor: string
  primaryChartBottomColor: string
  secondaryChartColor: string
  secondaryChartTopColor: string
  secondaryChartBottomColor: string
  histogramChartColor: string
  gaugeChartArcColor: string
  gaugeChartCircleBackgroundColor: string
  gradientDiagramBackgroundColor: string

  // Loaders / animations
  shineAnimationGradient: string
  loaderBackgroundColor: string
  primaryBtnSpinnerColor: string

  // Tabs
  forTabs: string

  // Const colors (shared across themes)
  cyanColor: string

  // Disabled states
  buttonDisabled: string
}
