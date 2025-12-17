'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useI18n, LanguageSwitcher } from '@/lib/i18n'
import { DashboardIcon, FeedbackIcon, TablesIcon, AlertsIcon, SettingsIcon, LogoutIcon, PaletteIcon } from './Icons'
import styles from './Sidebar.module.css'

interface SidebarProps {
  businessName?: string
  dashboardLogo?: string | null
  alertCount?: number
}

export function Sidebar({ businessName, dashboardLogo, alertCount = 0 }: SidebarProps) {
  const { t } = useI18n()
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navItems = [
    { href: '/dashboard', icon: DashboardIcon, label: t('dashboard.sidebar.dashboard') },
    { href: '/dashboard/feedback', icon: FeedbackIcon, label: t('dashboard.sidebar.feedback') },
    { href: '/dashboard/setup', icon: TablesIcon, label: t('dashboard.sidebar.tables') },
    { href: '/dashboard/alerts', icon: AlertsIcon, label: t('dashboard.sidebar.alerts'), badge: alertCount },
    { href: '/dashboard/branding', icon: PaletteIcon, label: t('dashboard.sidebar.branding') },
    { href: '/dashboard/settings', icon: SettingsIcon, label: t('dashboard.sidebar.settings') },
  ]

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        {dashboardLogo && (
          <img src={dashboardLogo} alt="Logo" className={styles.dashboardLogo} />
        )}
        <h1 className={styles.businessName}>{businessName || t('dashboard.sidebar.dashboard')}</h1>
        <LanguageSwitcher className={styles.languageSwitcher} />
      </div>
      
      <nav className={styles.sidebarNav}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navItem} ${pathname === item.href ? styles.navItemActive : ''}`}
          >
            <item.icon className={styles.navIcon} />
            {item.label}
            {item.badge !== undefined && item.badge > 0 && (
              <span className={styles.alertBadge}>{item.badge}</span>
            )}
          </Link>
        ))}
      </nav>
      
      <div className={styles.sidebarFooter}>
        <button onClick={handleLogout} className={styles.logoutButton}>
          <LogoutIcon className={styles.navIcon} />
          {t('dashboard.sidebar.logout')}
        </button>
      </div>
    </aside>
  )
}
