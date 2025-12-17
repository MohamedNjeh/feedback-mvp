// Google Fonts list for the branding configuration
export const GOOGLE_FONTS = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Raleway',
  'Nunito',
  'Playfair Display',
  'Merriweather',
  'Source Sans Pro',
  'PT Sans',
  'Ubuntu',
  'Oswald',
  'Quicksand',
  'Work Sans',
  'DM Sans',
  'Outfit',
  'Space Grotesk',
  'Cairo', // Arabic support
  'Tajawal', // Arabic support
  'Amiri', // Arabic support
] as const

export const SYSTEM_FONTS = [
  'system-ui',
  'Arial',
  'Helvetica',
  'Georgia',
  'Times New Roman',
  'Verdana',
] as const

export const ALL_FONTS = [...SYSTEM_FONTS, ...GOOGLE_FONTS]
