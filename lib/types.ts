// Shared TypeScript types for the application

export interface Feedback {
  id: string
  table: number
  location: string
  rating: number
  comment: string
  timestamp: string
  image_path: string[] | null
  imageUrl?: string
  business_id: string
}

export interface Business {
  id: string
  name: string
  owner_email: string
  branding?: BrandingConfig
  dashboard_logo?: string
}

export interface Table {
  id: string
  business_id: string
  table_number: number
  qr_url: string
}

// Branding Configuration Types
export type LogoSize = 'small' | 'medium' | 'large'
export type LogoShape = 'square' | 'rounded' | 'circle'
export type HeaderStyle = 'minimal' | 'centered' | 'left-aligned'
export type CardStyle = 'flat' | 'elevated' | 'rounded'
export type Spacing = 'compact' | 'regular' | 'spacious'
export type FontWeight = 'light' | 'regular' | 'bold'

export interface BrandColors {
  primary: string
  secondary: string
  background: string
  accent: string
}

export interface Typography {
  fontFamily: string
  titleSize: number
  subtitleSize: number
  bodySize: number
  fontWeight: FontWeight
}

export interface LayoutOptions {
  headerStyle: HeaderStyle
  cardStyle: CardStyle
  spacing: Spacing
  showSentimentIcons: boolean
  glassEnabled: boolean
}

export interface CustomBranding {
  slogan: string
  thankYouMessage: string
  ctaButtonText: string
  ctaButtonColor: string
  languageSwitcherColor: string
  glassCardTint: string
  ratingButtonColor: string
}

export interface BrandingConfig {
  // Logo
  logoUrl: string | null
  logoSize: LogoSize
  logoShape: LogoShape
  
  // Colors
  colors: BrandColors
  
  // Typography
  typography: Typography
  
  // Layout
  layout: LayoutOptions
  
  // Custom Elements
  custom: CustomBranding
}

export const DEFAULT_BRANDING: BrandingConfig = {
  logoUrl: null,
  logoSize: 'medium',
  logoShape: 'rounded',
  colors: {
    primary: '#4F46E5',
    secondary: '#6366F1',
    background: '#F8F9FA',
    accent: '#10B981',
  },
  typography: {
    fontFamily: 'Inter',
    titleSize: 24,
    subtitleSize: 16,
    bodySize: 14,
    fontWeight: 'regular',
  },
  layout: {
    headerStyle: 'centered',
    cardStyle: 'elevated',
    spacing: 'regular',
    showSentimentIcons: true,
    glassEnabled: true,
  },
  custom: {
    slogan: '',
    thankYouMessage: 'Thank you for your feedback!',
    ctaButtonText: 'Send Feedback',
    ctaButtonColor: '#4F46E5',
    languageSwitcherColor: '#6B7280',
    glassCardTint: '#667eea',
    ratingButtonColor: '#ffffff',
  },
}
