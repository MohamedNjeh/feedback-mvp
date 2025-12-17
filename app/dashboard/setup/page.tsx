'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useI18n } from '@/lib/i18n'
import { useAuth } from '@/hooks'
import { Sidebar } from '@/components/Sidebar'
import type { Table } from '@/lib/types'
import QRCode from 'qrcode'
import styles from './setup.module.css'

export default function SetupTables() {
  const { t } = useI18n()
  const { business, loading: authLoading } = useAuth()
  const [tables, setTables] = useState<Table[]>([])
  const [tableCount, setTableCount] = useState('')
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [qrCodes, setQrCodes] = useState<{ [key: number]: string }>({})
  const [baseUrl, setBaseUrl] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin)
    }
  }, [])

  const generateQRCodesForTables = useCallback(async (tablesToGenerate: Table[]) => {
    const codes: { [key: number]: string } = {}
    for (const table of tablesToGenerate) {
      try {
        const qrDataUrl = await QRCode.toDataURL(table.qr_url, {
          width: 300,
          margin: 2,
        })
        codes[table.table_number] = qrDataUrl
      } catch (err) {
        console.error('Error generating QR code:', err)
      }
    }
    setQrCodes(codes)
  }, [])

  const fetchTables = useCallback(async (businessId: string) => {
    const { data, error } = await supabase
      .from('tables')
      .select('*')
      .eq('business_id', businessId)
      .order('table_number', { ascending: true })

    if (!error && data) {
      setTables(data)
      generateQRCodesForTables(data)
    }
    setLoading(false)
  }, [generateQRCodesForTables])

  useEffect(() => {
    if (business?.id) {
      fetchTables(business.id)
    }
  }, [business?.id, fetchTables])

  const handleGenerateTables = async () => {
    if (!business || !tableCount) return

    const count = parseInt(tableCount)
    if (isNaN(count) || count <= 0 || count > 500) {
      alert('Please enter a valid number between 1 and 500')
      return
    }

    setGenerating(true)

    // Delete existing tables
    await supabase
      .from('tables')
      .delete()
      .eq('business_id', business.id)

    // Create new tables
    const newTables: Omit<Table, 'id'>[] = []
    for (let i = 1; i <= count; i++) {
      const qrUrl = `${baseUrl}/survey?business=${business.id}&table=${i}`
      newTables.push({
        business_id: business.id,
        table_number: i,
        qr_url: qrUrl,
      })
    }

    const { data, error } = await supabase
      .from('tables')
      .insert(newTables)
      .select()

    if (error) {
      console.error('Error creating tables:', error)
      alert('Error creating tables: ' + error.message)
    } else if (data) {
      setTables(data)
      await generateQRCodesForTables(data)
    }

    setGenerating(false)
  }

  const downloadQRCode = (tableNumber: number) => {
    const qrDataUrl = qrCodes[tableNumber]
    if (!qrDataUrl) return

    const link = document.createElement('a')
    link.download = `table-${tableNumber}-qr.png`
    link.href = qrDataUrl
    link.click()
  }

  const downloadAllQRCodes = async () => {
    for (const table of tables) {
      const qrDataUrl = qrCodes[table.table_number]
      if (qrDataUrl) {
        const link = document.createElement('a')
        link.download = `table-${table.table_number}-qr.png`
        link.href = qrDataUrl
        link.click()
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
  }

  if (authLoading || loading) {
    return <div className={styles.loading}>{t('common.loading')}</div>
  }

  return (
    <div className={styles.pageWrapper}>
      <Sidebar businessName={business?.name} dashboardLogo={business?.dashboard_logo} />

      {/* Main Content */}
      <main className={styles.mainContent}>
        <header className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>{t('tables.title')}</h1>
          <p className={styles.pageSubtitle}>{t('tables.subtitle')}</p>
        </header>

        {/* Generator Card */}
        <div className={styles.generatorCard}>
          <h2 className={styles.generatorTitle}>{t('tables.generate_title')}</h2>
          <p className={styles.generatorDescription}>
            {t('tables.generate_description')}
          </p>
          <div className={styles.generatorForm}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{t('tables.number_of_tables')}</label>
              <input
                type="number"
                value={tableCount}
                onChange={(e) => setTableCount(e.target.value)}
                min="1"
                max="500"
                placeholder={t('tables.placeholder')}
                className={styles.formInput}
              />
            </div>
            <button
              onClick={handleGenerateTables}
              disabled={generating || !tableCount}
              className={styles.generateButton}
            >
              {generating ? t('tables.generating') : t('tables.generate_button')}
            </button>
          </div>
          {tables.length > 0 && (
            <p className={styles.warningText}>
              {t('tables.replace_warning', { count: tables.length })}
            </p>
          )}
        </div>

        {/* Tables Grid */}
        {tables.length > 0 && (
          <section className={styles.tablesSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>{t('tables.your_tables', { count: tables.length })}</h2>
              <button onClick={downloadAllQRCodes} className={styles.downloadAllButton}>
                {t('tables.download_all')}
              </button>
            </div>
            
            <div className={styles.qrGrid}>
              {tables.map((table) => (
                <div key={table.id} className={styles.qrCard}>
                  <h3 className={styles.qrCardTitle}>{t('survey.table', { number: table.table_number })}</h3>
                  {qrCodes[table.table_number] && (
                    <img
                      src={qrCodes[table.table_number]}
                      alt={`QR Code for Table ${table.table_number}`}
                      className={styles.qrImage}
                    />
                  )}
                  <button
                    onClick={() => downloadQRCode(table.table_number)}
                    className={styles.downloadButton}
                  >
                    {t('tables.download_qr')}
                  </button>
                  <p className={styles.qrUrl}>{table.qr_url}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {tables.length === 0 && (
          <section className={styles.tablesSection}>
            <div className={styles.emptyState}>
              <p>{t('tables.empty')}</p>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
