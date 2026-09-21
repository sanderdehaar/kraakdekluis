import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import emailjs from '@emailjs/browser'
import jsQR from 'jsqr'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { QrCode } from 'lucide-react'

import '../../styles/page.css'

import { db } from '../../firebase'

import ActionButton from '../../components/buttons/ActionButton/ActionButton'
import PrizeModal from '../../components/feedback/PrizeModal/PrizeModal'
import BrandHeader from '../../components/layout/BrandHeader/BrandHeader'
import VaultDisplay from '../../components/media/VaultDisplay/VaultDisplay'

type ResultType = 'win' | 'fail' | 'clue'

type QRCodeData = {
  kind?: 'vault' | 'can'
  type: ResultType
  prizeId: string | null
  claimed: boolean
  clue?: string
}

type PrizeData = {
  name: string
  description: string
  claimMessage?: string
}

type TVAnimation =
  | 'idle'
  | 'scanning'
  | 'win'
  | 'fail'
  | 'clue'

function PrizeVaultPage() {
  const [code, setCode] = useState<string | null>(null)
  const [qrData, setQrData] = useState<QRCodeData | null>(null)
  const [prize, setPrize] = useState<PrizeData | null>(null)
  const [qrCollection, setQrCollection] = useState<'qrCodes' | 'canQrCodes'>('canQrCodes')
  const [loading, setLoading] = useState(false)
  const [claimed, setClaimed] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [, setError] = useState(false)
  const [tvAnimation, setTvAnimation] =
    useState<TVAnimation>('idle')

  const qrInputRef = useRef<HTMLInputElement>(null)

  async function loadPrize(prizeId: string | null) {
    if (!prizeId) {
      setPrize(null)
      return null
    }

    const prizeSnapshot = await getDoc(doc(db, 'prizes', prizeId))
    const prizeData = prizeSnapshot.exists()
      ? prizeSnapshot.data() as PrizeData
      : null

    setPrize(prizeData)
    return prizeData
  }

  async function findQRCode(codeValue: string) {
    const collections = ['qrCodes', 'canQrCodes'] as const

    for (const collectionName of collections) {
      const snapshot = await getDoc(doc(db, collectionName, codeValue))

      if (snapshot.exists()) {
        return {
          collectionName,
          data: snapshot.data() as QRCodeData,
        }
      }
    }

    return null
  }

  useEffect(() => {
    async function loadQRCode() {
      const params = new URLSearchParams(window.location.search)
      const urlCode =
        params.get('code')?.trim() || null

      setCode(urlCode)
      setLoading(false)

      if (!urlCode) {
        return
      }

      await processQRCode(urlCode)
    }

    loadQRCode()
  }, [])

  function extractCodeFromQR(value: string) {
    try {
      const url = new URL(value)
      const queryCode = url.searchParams.get('code')

      if (queryCode) {
        return queryCode.trim()
      }

      const parts = url.pathname
        .split('/')
        .filter(Boolean)

      if (parts.length > 0) {
        return parts[parts.length - 1].trim()
      }
    } catch {
      // Raw QR code
    }

    return value.trim()
  }

  async function processQRCode(scannedValue: string) {
    const extractedCode =
      extractCodeFromQR(scannedValue)

    if (!extractedCode) {
      setError(true)
      setTvAnimation('fail')
      return
    }

    try {
      setError(false)
      setTvAnimation('scanning')

      const result = await findQRCode(extractedCode)

      if (!result) {
        setError(true)
        setTvAnimation('fail')

        setTimeout(() => {
          setTvAnimation('idle')
        }, 2500)

        return
      }

      const data = result.data

      setCode(extractedCode)
      setQrData(data)
      setClaimed(data.claimed)
      setQrCollection(result.collectionName)
      await loadPrize(data.prizeId)

      setTimeout(() => {
        setTvAnimation(data.type)
      }, 1500)

      setTimeout(() => {
        setShowModal(true)
      }, 3000)
    } catch (firebaseError) {
      console.error(
        'Failed to process QR code:',
        firebaseError,
      )

      setError(true)
      setTvAnimation('fail')

      setTimeout(() => {
        setTvAnimation('idle')
      }, 2500)
    }
  }

  async function scanImage(file: File) {
    setError(false)
    setTvAnimation('scanning')

    const image = new Image()
    const objectUrl = URL.createObjectURL(file)

    image.onload = async () => {
      try {
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')

        if (!context) {
          throw new Error(
            'Could not create canvas context',
          )
        }

        canvas.width = image.naturalWidth
        canvas.height = image.naturalHeight

        context.drawImage(
          image,
          0,
          0,
          canvas.width,
          canvas.height,
        )

        const imageData = context.getImageData(
          0,
          0,
          canvas.width,
          canvas.height,
        )

        const result = jsQR(
          imageData.data,
          imageData.width,
          imageData.height,
        )

        URL.revokeObjectURL(objectUrl)

        if (!result) {
          setError(true)
          setTvAnimation('fail')

          setTimeout(() => {
            setTvAnimation('idle')
          }, 2500)

          return
        }

        await processQRCode(result.data)
      } catch (scanError) {
        console.error(
          'QR scan failed:',
          scanError,
        )

        URL.revokeObjectURL(objectUrl)

        setError(true)
        setTvAnimation('fail')

        setTimeout(() => {
          setTvAnimation('idle')
        }, 2500)
      }
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)

      setError(true)
      setTvAnimation('fail')
    }

    image.src = objectUrl
  }

  function handleScan() {
    qrInputRef.current?.click()
  }

  function handleQRFile(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0]

    if (file) {
      scanImage(file)
    }

    event.target.value = ''
  }

  async function handlePasswordSubmit(
    password: string,
  ) {
    if (!qrData && password.trim()) {
      await processQRCode(password.trim())
      return
    }

    if (!code || !qrData || claimed) {
      return
    }

    if (password.trim() !== code) {
      setTvAnimation('fail')

      setTimeout(() => {
        setTvAnimation('idle')
      }, 2500)

      return
    }

    try {
      const latestSnapshot = await getDoc(doc(db, qrCollection, code))

      if (!latestSnapshot.exists()) {
        setError(true)
        return
      }

      const latestData =
        latestSnapshot.data() as QRCodeData

      if (latestData.claimed) {
        setClaimed(true)
        setQrData(latestData)
        await loadPrize(latestData.prizeId)
        setTvAnimation(latestData.type)

        setTimeout(() => {
          setShowModal(true)
        }, 1200)
        return
      }

      setClaimed(false)
      setQrData(latestData)
      await loadPrize(latestData.prizeId)
      setTvAnimation(latestData.type)

      setTimeout(() => {
        setShowModal(true)
      }, 1200)
    } catch (firebaseError) {
      console.error(
        'Failed to claim QR code:',
        firebaseError,
      )

      setError(true)
    }
  }

  async function handleClaimContact(payload: {
    name: string
    email: string
  }) {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

    if (!serviceId || !templateId || !publicKey) {
      console.error(
        'EmailJS is not configured. Add VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, and VITE_EMAILJS_PUBLIC_KEY to your .env file.',
      )
      throw new Error(
        'The prize claim email service is not configured yet.',
      )
    }

    await emailjs.send(
      serviceId,
      templateId,
      {
        from_name: payload.name,
        from_email: payload.email,
        prize_name: prize?.name ?? 'Prize',
        code: code ?? '',
        reply_to: payload.email,
        to_email: payload.email,
      },
      {
        publicKey,
      },
    )

    if (!code) {
      throw new Error('No QR code is active for this prize claim.')
    }

    await updateDoc(doc(db, qrCollection, code), {
      claimed: true,
    })

    setClaimed(true)
    setQrData((currentData) =>
      currentData
        ? { ...currentData, claimed: true }
        : currentData,
    )

    return true
  }

  function closeModal() {
    setShowModal(false)
    setTvAnimation(qrData?.type === 'fail' ? 'fail' : 'idle')
  }

  if (loading) {
    return (
      <main className="page">
        <div className="flex min-h-screen items-center justify-center bg-[#ff6a00] text-white">
          <div className="text-center">
            <p className="text-sm font-black tracking-[4px]">
              FANTA × STUKTV
            </p>

            <h1 className="mt-5 text-[42px] font-black">
              LOADING...
            </h1>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="page">
      <BrandHeader />

      <VaultDisplay
        mode="crack"
        animation={tvAnimation}
        onPasswordSubmit={handlePasswordSubmit}
      />

      <input
        ref={qrInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleQRFile}
        style={{
          display: 'none',
        }}
      />

      <div
        className="disclaimer"
        style={{
          zIndex: 100,
          pointerEvents: 'none',
        }}
      >
        <div
          className="flex flex-col items-center"
          style={{
            pointerEvents: 'auto',
          }}
        >
          <ActionButton onClick={handleScan}>
            <QrCode
              size={22}
              strokeWidth={2}
            />

            <span>
              SCAN QR
            </span>
          </ActionButton>

          <div
            className="mt-5 flex items-center justify-center whitespace-nowrap"
            style={{
              fontFamily: 'Fanta, sans-serif',
              fontSize: 'clamp(12px, 1.25vw, 15px)',
              lineHeight: 1,
              fontWeight: 400,
              maxWidth: '90vw',
              textTransform: 'uppercase',
            }}
          >
            <span>
              Enter password to unlock the vault
            </span>

            <span className="mx-3">
              ·
            </span>

            <a
              href="/vault-locations"
              className="!text-white underline underline-offset-4"
            >
              View vault locations
            </a>
          </div>
        </div>
      </div>

      {showModal && qrData && (
        <PrizeModal
          result={{
            status: qrData.type,
            prize: prize?.name,
            clue: qrData.clue,
          }}
          isClaimed={claimed}
          onClose={closeModal}
          onSubmitContact={handleClaimContact}
        />
      )}

    </main>
  )
}

export default PrizeVaultPage