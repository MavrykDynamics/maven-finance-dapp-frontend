import { z } from 'zod'

export const LIGHT_THEME = 'light'
export const SPACE_THEME = 'space'
export const DARK_THEME = 'dark'

export const themeSchema = z.enum([LIGHT_THEME, SPACE_THEME, DARK_THEME])
export type ThemeType = z.infer<typeof themeSchema>
