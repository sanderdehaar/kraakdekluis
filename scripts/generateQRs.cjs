const QRCode = require('qrcode')
const fs = require('fs')
const path = require('path')

/*
 * CHANGE THIS TO YOUR REAL WEBSITE
 */

const BASE_URL = 'https://YOUR-DOMAIN.nl/crack'

/*
 * ALL REAL QR CODES
 */

const codes = [
  'FANTA001',
  'FANTA002',
  'FANTA003',
  'FANTA004',
  'FANTA005',
]

/*
 * OUTPUT FOLDER
 */

const outputFolder = path.join(
  __dirname,
  '../public/qr'
)

if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder, {
    recursive: true,
  })
}

/*
 * GENERATE QR CODES
 */

async function generate() {
  for (const code of codes) {
    const url = `${BASE_URL}?code=${code}`

    const filePath = path.join(
      outputFolder,
      `${code}.png`
    )

    await QRCode.toFile(
      filePath,
      url,
      {
        width: 1000,
        margin: 2,
        errorCorrectionLevel: 'H',
      }
    )

    console.log('')
    console.log(`Generated: ${code}`)
    console.log(url)
  }

  console.log('')
  console.log('All QR codes generated!')
}

generate()