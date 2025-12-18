'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useI18n, LanguageSwitcher } from '@/lib/i18n'
import styles from './landing.module.css'

// Icons as inline SVGs for fast loading
const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16.667 5L7.5 14.167L3.333 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const AlertIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 8A6 6 0 106 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const DashboardIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="7" height="9" rx="1" stroke="currentColor" strokeWidth="2"/>
    <rect x="14" y="3" width="7" height="5" rx="1" stroke="currentColor" strokeWidth="2"/>
    <rect x="14" y="12" width="7" height="9" rx="1" stroke="currentColor" strokeWidth="2"/>
    <rect x="3" y="16" width="7" height="5" rx="1" stroke="currentColor" strokeWidth="2"/>
  </svg>
)

const BrandingIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 3a9 9 0 019 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="3" fill="currentColor"/>
  </svg>
)

const LanguageIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
    <path d="M3 12h18M12 3c2.5 2.5 4 5.5 4 9s-1.5 6.5-4 9c-2.5-2.5-4-5.5-4-9s1.5-6.5 4-9z" stroke="currentColor" strokeWidth="2"/>
  </svg>
)

const CameraIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2"/>
  </svg>
)

const PhoneIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="2"/>
    <line x1="12" y1="18" x2="12" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

export default function LandingPage() {
  const { t } = useI18n()
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const features = [
    { icon: <AlertIcon />, key: 'alerts' },
    { icon: <DashboardIcon />, key: 'dashboard' },
    { icon: <BrandingIcon />, key: 'branding' },
    { icon: <LanguageIcon />, key: 'languages' },
    { icon: <CameraIcon />, key: 'photos' },
    { icon: <PhoneIcon />, key: 'no_app' },
  ]

  const steps = [
    { number: '1', key: 'step1' },
    { number: '2', key: 'step2' },
    { number: '3', key: 'step3' },
  ]

  const audiences = [
    { emoji: '🍽️', key: 'restaurants' },
    { emoji: '☕', key: 'cafes' },
    { emoji: '🏨', key: 'hospitality' },
    { emoji: '🏪', key: 'small_business' },
  ]

  const faqs = [
    'app_needed',
    'notifications',
    'customize',
    'languages',
    'setup_time',
    'security',
  ]

  return (
    <div className={styles.page}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.navContainer}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoIcon}>📊</span>
            AlertTable
          </Link>
          <div className={styles.navLinks}>
            <a href="#features" className={styles.navLink}>{t('landing.nav.features')}</a>
            <a href="#how-it-works" className={styles.navLink}>{t('landing.nav.how_it_works')}</a>
            <a href="#pricing" className={styles.navLink}>{t('landing.nav.pricing')}</a>
            <LanguageSwitcher className={styles.langSwitcher} />
            <Link href="/login" className={styles.navButton}>{t('landing.nav.login')}</Link>
          </div>
          <button className={styles.mobileMenuBtn} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <MenuIcon />
          </button>
        </div>
        {mobileMenuOpen && (
          <div className={styles.mobileMenu}>
            <a href="#features" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>{t('landing.nav.features')}</a>
            <a href="#how-it-works" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>{t('landing.nav.how_it_works')}</a>
            <a href="#pricing" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>{t('landing.nav.pricing')}</a>
            <Link href="/login" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>{t('landing.nav.login')}</Link>
            <LanguageSwitcher className={styles.mobileLangSwitcher} />
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>{t('landing.hero.title')}</h1>
            <p className={styles.heroSubtitle}>{t('landing.hero.subtitle')}</p>
            <div className={styles.heroCtas}>
              <Link href="/signup" className={styles.ctaPrimary}>
                {t('landing.hero.cta_primary')}
              </Link>
              <a href="#how-it-works" className={styles.ctaSecondary}>
                {t('landing.hero.cta_secondary')}
              </a>
            </div>
            <div className={styles.trustBadges}>
              <span className={styles.badge}><CheckIcon /> {t('landing.hero.badge1')}</span>
              <span className={styles.badge}><CheckIcon /> {t('landing.hero.badge2')}</span>
              <span className={styles.badge}><CheckIcon /> {t('landing.hero.badge3')}</span>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.mockupPhone}>
              <div className={styles.mockupScreen}>
                <div className={styles.mockupHeader}>
                  <div className={styles.mockupLogo}>🍕</div>
                  <span>Table 5</span>
                </div>
                <p className={styles.mockupTitle}>{t('landing.hero.mockup_title')}</p>
                <div className={styles.mockupEmojis}>
                  <span>😡</span>
                  <span>😞</span>
                  <span>😐</span>
                  <span className={styles.emojiActive}>😊</span>
                  <span>😍</span>
                </div>
              </div>
            </div>
            <div className={styles.alertBubble}>
              <span className={styles.alertIcon}>🔔</span>
              <div>
                <strong>{t('landing.hero.alert_title')}</strong>
                <p>{t('landing.hero.alert_text')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className={styles.problem}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>{t('landing.problem.title')}</h2>
          <p className={styles.sectionSubtitle}>{t('landing.problem.subtitle')}</p>
          <div className={styles.painPoints}>
            <div className={styles.painPoint}>
              <span className={styles.painIcon}>⏰</span>
              <p>{t('landing.problem.pain1')}</p>
            </div>
            <div className={styles.painPoint}>
              <span className={styles.painIcon}>❓</span>
              <p>{t('landing.problem.pain2')}</p>
            </div>
            <div className={styles.painPoint}>
              <span className={styles.painIcon}>⭐</span>
              <p>{t('landing.problem.pain3')}</p>
            </div>
            <div className={styles.painPoint}>
              <span className={styles.painIcon}>🚪</span>
              <p>{t('landing.problem.pain4')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className={styles.solution}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>{t('landing.solution.title')}</h2>
          <p className={styles.sectionText}>{t('landing.solution.text1')}</p>
          <p className={styles.sectionText}>{t('landing.solution.text2')}</p>
          <div className={styles.benefits}>
            <div className={styles.benefit}>
              <span className={styles.benefitIcon}>📱</span>
              <h3>{t('landing.solution.benefit1_title')}</h3>
              <p>{t('landing.solution.benefit1_text')}</p>
            </div>
            <div className={styles.benefit}>
              <span className={styles.benefitIcon}>🔇</span>
              <h3>{t('landing.solution.benefit2_title')}</h3>
              <p>{t('landing.solution.benefit2_text')}</p>
            </div>
            <div className={styles.benefit}>
              <span className={styles.benefitIcon}>⚡</span>
              <h3>{t('landing.solution.benefit3_title')}</h3>
              <p>{t('landing.solution.benefit3_text')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className={styles.howItWorks}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>{t('landing.how.title')}</h2>
          <div className={styles.steps}>
            {steps.map((step) => (
              <div key={step.key} className={styles.step}>
                <div className={styles.stepNumber}>{step.number}</div>
                <h3 className={styles.stepTitle}>{t(`landing.how.${step.key}_title`)}</h3>
                <p className={styles.stepText}>{t(`landing.how.${step.key}_text`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className={styles.features}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>{t('landing.features.title')}</h2>
          <div className={styles.featuresGrid}>
            {features.map((feature) => (
              <div key={feature.key} className={styles.featureCard}>
                <div className={styles.featureIcon}>{feature.icon}</div>
                <h3 className={styles.featureTitle}>{t(`landing.features.${feature.key}_title`)}</h3>
                <p className={styles.featureText}>{t(`landing.features.${feature.key}_text`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Preview */}
      <section className={styles.preview}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>{t('landing.preview.title')}</h2>
          <p className={styles.sectionSubtitle}>{t('landing.preview.subtitle')}</p>
          <div className={styles.previewImages}>
            <div className={styles.previewCard}>
              <div className={styles.previewMockup}>
                <div className={styles.dashboardMock}>
                  <div className={styles.dashboardHeader}>
                    <span>📊 Dashboard</span>
                  </div>
                  <div className={styles.dashboardStats}>
                    <div className={styles.statCard}>
                      <span className={styles.statValue}>4.5</span>
                      <span className={styles.statLabel}>{t('landing.preview.today_score')}</span>
                    </div>
                    <div className={styles.statCard}>
                      <span className={styles.statValue}>23</span>
                      <span className={styles.statLabel}>{t('landing.preview.new_feedback')}</span>
                    </div>
                    <div className={styles.statCard}>
                      <span className={styles.statValueAlert}>2</span>
                      <span className={styles.statLabel}>{t('landing.preview.alerts')}</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className={styles.previewCaption}>{t('landing.preview.dashboard_caption')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className={styles.audience}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>{t('landing.audience.title')}</h2>
          <div className={styles.audienceGrid}>
            {audiences.map((audience) => (
              <div key={audience.key} className={styles.audienceCard}>
                <span className={styles.audienceEmoji}>{audience.emoji}</span>
                <h3 className={styles.audienceTitle}>{t(`landing.audience.${audience.key}_title`)}</h3>
                <p className={styles.audienceText}>{t(`landing.audience.${audience.key}_text`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section id="pricing" className={styles.pricing}>
        <div className={styles.container}>
          <div className={styles.pricingCard}>
            <h2 className={styles.pricingTitle}>{t('landing.pricing.title')}</h2>
            <p className={styles.pricingText}>{t('landing.pricing.text')}</p>
            <Link href="/signup" className={styles.pricingCta}>
              {t('landing.pricing.cta')}
            </Link>
            <p className={styles.pricingNote}>{t('landing.pricing.note')}</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className={styles.faq}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>{t('landing.faq.title')}</h2>
          <div className={styles.faqList}>
            {faqs.map((faq, index) => (
              <div 
                key={faq} 
                className={`${styles.faqItem} ${openFaq === index ? styles.faqOpen : ''}`}
              >
                <button 
                  className={styles.faqQuestion}
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  {t(`landing.faq.${faq}_q`)}
                  <span className={styles.faqToggle}>{openFaq === index ? '−' : '+'}</span>
                </button>
                {openFaq === index && (
                  <div className={styles.faqAnswer}>
                    {t(`landing.faq.${faq}_a`)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className={styles.finalCta}>
        <div className={styles.container}>
          <h2 className={styles.finalTitle}>{t('landing.final.title')}</h2>
          <p className={styles.finalText}>{t('landing.final.text')}</p>
          <Link href="/signup" className={styles.finalButton}>
            {t('landing.final.cta')}
          </Link>
          <p className={styles.finalNote}>{t('landing.final.note')}</p>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.footerBrand}>
            <Link href="/" className={styles.footerLogo}>
              <span>📊</span> AlertTable
            </Link>
            <p className={styles.footerTagline}>{t('landing.footer.tagline')}</p>
          </div>
          <div className={styles.footerLinks}>
            <div className={styles.footerColumn}>
              <h4>{t('landing.footer.product')}</h4>
              <a href="#features">{t('landing.nav.features')}</a>
              <a href="#pricing">{t('landing.nav.pricing')}</a>
              <a href="#how-it-works">{t('landing.nav.how_it_works')}</a>
            </div>
            <div className={styles.footerColumn}>
              <h4>{t('landing.footer.company')}</h4>
              <a href="mailto:hello@alerttable.com">{t('landing.footer.contact')}</a>
              <Link href="/privacy">{t('landing.footer.privacy')}</Link>
              <Link href="/terms">{t('landing.footer.terms')}</Link>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>© 2025 AlertTable. {t('landing.footer.rights')}</p>
        </div>
      </footer>
    </div>
  )
}
