import QRCode from 'qrcode'
import * as fs from 'fs'
import * as path from 'path'

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const LOCATION = process.env.LOCATION || 'Default'
const TABLE_COUNT = parseInt(process.env.TABLE_COUNT || '10')
const OUTPUT_DIR = './qr-codes'

async function generateQRCodes() {
  // Create output directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  console.log(`Generating QR codes for ${TABLE_COUNT} tables...`)
  console.log(`Base URL: ${BASE_URL}`)
  console.log(`Location: ${LOCATION}`)
  console.log(`Output directory: ${OUTPUT_DIR}`)
  console.log('')

  for (let table = 1; table <= TABLE_COUNT; table++) {
    const surveyUrl = `${BASE_URL}?table=${table}&location=${encodeURIComponent(LOCATION)}`
    const outputPath = path.join(OUTPUT_DIR, `table-${table}.png`)

    try {
      await QRCode.toFile(outputPath, surveyUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })
      console.log(`✓ Table ${table}: ${outputPath}`)
      console.log(`  URL: ${surveyUrl}`)
    } catch (error) {
      console.error(`✗ Error generating QR code for table ${table}:`, error)
    }
  }

  console.log('')
  console.log('QR code generation complete!')
  console.log(`Files saved to: ${path.resolve(OUTPUT_DIR)}`)
}

generateQRCodes()
