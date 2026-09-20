import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  doc,
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

const qrCodes = JSON.parse(
  fs.readFileSync(jsonPath, 'utf8'),
)

async function seedDatabase() {
  console.log('')
  console.log('Starting Firebase seed...')
  console.log('')

  const qrCollection = collection(db, 'qrCodes')

  for (const [code, data] of Object.entries(qrCodes)) {
    await setDoc(doc(qrCollection, code), data)

    console.log(`Created: ${code}`)
  }

  console.log('')
  console.log('All QR codes added to Firebase!')
  console.log('')
}

seedDatabase().catch((error) => {
  console.error('')
  console.error('Firebase seed failed:')
  console.error(error)
  console.error('')
  process.exit(1)
})