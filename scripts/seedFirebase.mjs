import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  doc,
  deleteDoc,
  getDoc,
  setDoc,
} from 'firebase/firestore'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const firebaseConfig = {
  apiKey: 'AIzaSyANcZoUZyHsKEzA9r-mBR6mNb5LLSAPl7c',
  authDomain: 'dekluis-5b76d.firebaseapp.com',
  projectId: 'dekluis-5b76d',
  storageBucket: 'dekluis-5b76d.firebasestorage.app',
  messagingSenderId: '796188258096',
  appId: '1:796188258096:web:7393acdbff4c8a31aa22f5',
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const jsonPath = path.join(
  __dirname,
  '../src/data/qrCodes.json',
)

const prizesPath = path.join(
  __dirname,
  '../src/data/prizes.json',
)

const canQrCodesPath = path.join(
  __dirname,
  '../src/data/canQrCodes.json',
)

const qrCodes = JSON.parse(
  fs.readFileSync(jsonPath, 'utf8'),
)

const prizes = JSON.parse(
  fs.readFileSync(prizesPath, 'utf8'),
)

const canQrCodes = JSON.parse(
  fs.readFileSync(canQrCodesPath, 'utf8'),
)

const legacyVaultCodes = [
  'FANTA001',
  'FANTA002',
  'FANTA003',
  'FANTA004',
  'FANTA005',
  '48391726',
  '76028415',
  '19563847',
  '82410693',
  '53179264',
]

const legacyCanCodes = [
  '9174062831',
  '6041839275',
  '7825406193',
  '3468192057',
  '8512746309',
]

async function seedDatabase() {
  console.log('')
  console.log('Starting Firebase seed...')
  console.log('')

  const qrCollection = collection(db, 'qrCodes')
  const overwriteClaimed = process.argv.includes('--reset-claims')

  for (const code of legacyVaultCodes) {
    await deleteDoc(doc(qrCollection, code))
  }

  for (const [code, data] of Object.entries(qrCodes)) {
    const qrRef = doc(qrCollection, code)
    const existingSnapshot = await getDoc(qrRef)
    const existingClaimed = existingSnapshot.exists()
      ? existingSnapshot.data().claimed
      : undefined

    await setDoc(qrRef, {
      ...data,
      ...(!overwriteClaimed && typeof existingClaimed === 'boolean'
        ? { claimed: existingClaimed }
        : {}),
    }, { merge: true })

    console.log(`Created: ${code}`)
  }

  const canQrCollection = collection(db, 'canQrCodes')

  for (const code of legacyCanCodes) {
    await deleteDoc(doc(canQrCollection, code))
  }

  for (const [code, data] of Object.entries(canQrCodes)) {
    const qrRef = doc(canQrCollection, code)
    const existingSnapshot = await getDoc(qrRef)
    const existingClaimed = existingSnapshot.exists()
      ? existingSnapshot.data().claimed
      : undefined

    await setDoc(qrRef, {
      ...data,
      ...(typeof existingClaimed === 'boolean'
        ? { claimed: existingClaimed }
        : {}),
    }, { merge: true })

    console.log(`Created can QR: ${code}`)
  }

  const prizesCollection = collection(db, 'prizes')

  for (const [prizeId, data] of Object.entries(prizes)) {
    await setDoc(doc(prizesCollection, prizeId), data, { merge: true })

    console.log(`Created prize: ${prizeId}`)
  }

  console.log('')
  console.log('All vault QR codes, can QR codes, and prizes added to Firebase!')
  console.log('')
}

seedDatabase().catch((error) => {
  console.error('')
  console.error('Firebase seed failed:')
  console.error(error)
  console.error('')
  process.exit(1)
})