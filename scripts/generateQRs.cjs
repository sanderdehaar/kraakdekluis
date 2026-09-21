const QRCode = require('qrcode')
const fs = require('fs')
const path = require('path')

/*
 * CHANGE THIS TO YOUR REAL WEBSITE
 */

const BASE_URL = 'https://kraakdekluis-na8i.vercel.app/crack'

/*
 * ALL REAL QR CODES
 */

const canCodes = [
  'C8vL2qM7xA4nR9pK',
  'N3fT8wJ1cP6yH4mQ',
  'R7aK2zD9vL5sX1nB',
  'M4qW8eC3rT7pY2hN',
  'X1nG6bV9kQ3dF8sJ',
]

const vaultCodes = [
  'V7qA2mN8rK4xP9dL',
  'H4pR8cT1nW6zQ2kM',
  'N9bL3xF7sD2vJ8qC',
  'Q5mY1rU8aK3pZ6tH',
  'B2kV7nC4wR9fM1xP',
  'L6pR2vK8mQ4xT9aN',
  'D3nW7cH1sP5zM8qV',
  'A9fJ4rN2yK6tB8xC',
  'T5qL1mV7dR3pH9kS',
  'G8xC2nF6wQ4aJ1zM',
  'P4vN9kD2sL7hR5xW',
  'K1mZ6qT3bV8nC4yH',
  'R7dF2pW9jA5kL3sQ',
  'Y2hM8vB4nX1cD7rK',
  'C5tQ9mG2xP6wN1aV',
  'J8rL3fS7kH2vM9pD',
  'W4nB1qX6dT8yC3mR',
  'M9pK5vA2rF7xL1hQ',
  'Z6cN2wJ8sD4mV9kP',
  'F3yR7bQ1nH5tX8cM',
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

async function generateSet(codes, folderName) {
  const folder = path.join(outputFolder, folderName)

  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true })
  }

  for (const code of codes) {
    const url = `${BASE_URL}?code=${code}`

    const filePath = path.join(folder, `${code}.png`)

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

async function generate() {
  await generateSet(canCodes, 'cans')
  await generateSet(vaultCodes, 'vaults')

  console.log('')
  console.log('All can and vault QR codes generated!')
}

generate()