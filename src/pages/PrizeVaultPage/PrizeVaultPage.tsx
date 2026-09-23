import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import emailjs from '@emailjs/browser'
import jsQR from 'jsqr'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { QrCode, X, Upload } from 'lucide-react'

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
  const [qrCollection, setQrCollection] =
    useState<'qrCodes' | 'canQrCodes'>('canQrCodes')
  const [loading, setLoading] = useState(false)
  const [claimed, setClaimed] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [, setError] = useState(false)
  const [tvAnimation, setTvAnimation] =
    useState<TVAnimation>('idle')
  const [scanning, setScanning] = useState(false)
  const [cameraError, setCameraError] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const qrInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanTimerRef = useRef<ReturnType<typeof window.setTimeout> | null>(null)
  const processingRef = useRef(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      '(max-width: 768px)',
    )

    const updateDevice = () => {
      setIsMobile(mediaQuery.matches)
    }

    updateDevice()
    mediaQuery.addEventListener('change', updateDevice)

    return () => {
      mediaQuery.removeEventListener(
        'change',
        updateDevice,
      )

      if (scanTimerRef.current !== null) {
        window.clearTimeout(scanTimerRef.current)
        scanTimerRef.current = null
      }

      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [])

  async function loadPrize(prizeId: string | null) {
    if (!prizeId) {
      setPrize(null)
      return null
    }

    const prizeSnapshot = await getDoc(
      doc(db, 'prizes', prizeId),
    )

    const prizeData = prizeSnapshot.exists()
      ? (prizeSnapshot.data() as PrizeData)
      : null

    setPrize(prizeData)
    return prizeData
  }

  async function findQRCode(codeValue: string) {
    const collections = ['qrCodes', 'canQrCodes'] as const

    for (const collectionName of collections) {
      const snapshot = await getDoc(
        doc(db, collectionName, codeValue),
      )

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
      const params = new URLSearchParams(
        window.location.search,
      )

      const urlCode =
        params.get('code')?.trim() || null

      setCode(urlCode)
      setLoading(false)

      if (!urlCode) return

      await processQRCode(urlCode)
    }

    loadQRCode()
  }, [])

  function extractCodeFromQR(value: string) {
    try {
      const url = new URL(value)

      const queryCode =
        url.searchParams.get('code')

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
      return value.trim()
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

      const result =
        await findQRCode(extractedCode)

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
        const context = canvas.getContext('2d', {
          willReadFrequently: true,
        })

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
          {
            inversionAttempts: 'attemptBoth',
          },
        )

        URL.revokeObjectURL(objectUrl)

        if (!result?.data) {
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
    if (isMobile) {
      startScanner()
      return
    }

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

  type NativeBarcodeDetector = {
    detect: (
      source: HTMLVideoElement,
    ) => Promise<Array<{ rawValue?: string }>>
  }

  type NativeBarcodeDetectorConstructor = new (options?: {
    formats?: string[]
  }) => NativeBarcodeDetector

  function getBarcodeDetector() {
    const Detector = (
      window as typeof window & {
        BarcodeDetector?: NativeBarcodeDetectorConstructor
      }
    ).BarcodeDetector

    if (!Detector) return null

    try {
      return new Detector({ formats: ['qr_code'] })
    } catch {
      return null
    }
  }

  async function startScanner() {
    if (scanning) return

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(true)
      return
    }

    try {
      setCameraError(false)
      setError(false)
      setTvAnimation('scanning')
      processingRef.current = false

      // Mount the video element before trying to attach the camera stream.
      setScanning(true)

      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve())
      })

      let stream: MediaStream

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { exact: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        })
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        })
      }

      streamRef.current = stream

      const video = videoRef.current

      if (!video) {
        stream.getTracks().forEach((track) => track.stop())
        streamRef.current = null
        setScanning(false)
        setCameraError(true)
        return
      }

      video.srcObject = stream
      video.setAttribute('playsinline', 'true')
      video.muted = true

      await new Promise<void>((resolve) => {
        if (video.readyState >= 2) {
          resolve()
          return
        }

        video.onloadedmetadata = () => resolve()
      })

      await video.play()

      scanFrame()
    } catch (error) {
      console.error('Unable to access camera:', error)
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
      setCameraError(true)
      setScanning(false)
    }
  }

  function stopScanner() {
    if (scanTimerRef.current !== null) {
      window.clearTimeout(scanTimerRef.current)
      scanTimerRef.current = null
    }

    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null

    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.srcObject = null
    }

    processingRef.current = false
    setScanning(false)
  }

  async function scanFrame() {
    if (processingRef.current) return

    const video = videoRef.current

    if (!video || video.readyState < 2 || !video.videoWidth) {
      scanTimerRef.current = window.setTimeout(scanFrame, 100)
      return
    }

    try {
      const detector = getBarcodeDetector()

      if (detector) {
        const detected = await detector.detect(video)
        const value = detected.find((item) => item.rawValue)?.rawValue

        if (value) {
          processingRef.current = true
          stopScanner()
          await processQRCode(value)
          return
        }
      }

      const canvas = canvasRef.current

      if (!canvas) {
        scanTimerRef.current = window.setTimeout(scanFrame, 120)
        return
      }

      const maxSize = 720
      const scale = Math.min(
        1,
        maxSize / Math.max(video.videoWidth, video.videoHeight),
      )
      const width = Math.max(1, Math.round(video.videoWidth * scale))
      const height = Math.max(1, Math.round(video.videoHeight * scale))

      canvas.width = width
      canvas.height = height

      const context = canvas.getContext('2d', {
        willReadFrequently: true,
      })

      if (!context) {
        scanTimerRef.current = window.setTimeout(scanFrame, 120)
        return
      }

      context.drawImage(video, 0, 0, width, height)

      const imageData = context.getImageData(
        0,
        0,
        width,
        height,
      )

      const result = jsQR(
        imageData.data,
        imageData.width,
        imageData.height,
        {
          inversionAttempts: 'attemptBoth',
        },
      )

      if (result?.data) {
        processingRef.current = true
        stopScanner()
        await processQRCode(result.data)
        return
      }
    } catch (error) {
      console.debug('QR scan attempt failed:', error)
    }

    if (!processingRef.current && streamRef.current) {
      scanTimerRef.current = window.setTimeout(scanFrame, 120)
    }
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
      const latestSnapshot = await getDoc(
        doc(db, qrCollection, code),
      )

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
    const serviceId =
      import.meta.env.VITE_EMAILJS_SERVICE_ID

    const templateId =
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID

    const publicKey =
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY

    if (
      !serviceId ||
      !templateId ||
      !publicKey
    ) {
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
      throw new Error(
        'No QR code is active for this prize claim.',
      )
    }

    await updateDoc(
      doc(db, qrCollection, code),
      {
        claimed: true,
      },
    )

    setClaimed(true)

    setQrData((currentData) =>
      currentData
        ? {
            ...currentData,
            claimed: true,
          }
        : currentData,
    )

    return true
  }

  function closeModal() {
    setShowModal(false)

    setTvAnimation(
      qrData?.type === 'fail'
        ? 'fail'
        : 'idle',
    )
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
        onPasswordSubmit={
          handlePasswordSubmit
        }
      />

      <input
        ref={qrInputRef}
        type="file"
        accept="image/*"
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
            {isMobile ? (
              <QrCode
                size={22}
                strokeWidth={2}
              />
            ) : (
              <Upload
                size={22}
                strokeWidth={2}
              />
            )}

            <span>
              {isMobile
                ? 'SCAN QR'
                : 'UPLOAD QR'}
            </span>
          </ActionButton>

          <div
            className="mt-5 flex items-center justify-center whitespace-nowrap"
            style={{
              fontFamily:
                'Fanta, sans-serif',
              fontSize:
                'clamp(12px, 1.25vw, 15px)',
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

      {cameraError && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 px-6">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center">
            <h2 className="text-2xl font-black">
              CAMERA ACCESS NEEDED
            </h2>

            <p className="mt-4 text-sm">
              Please allow camera access in
              your browser and try again.
            </p>

            <button
              type="button"
              onClick={() =>
                setCameraError(false)
              }
              className="mt-6 rounded-full bg-black px-8 py-4 font-black text-white"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

      {scanning && (
        <div className="fixed inset-0 z-[200] overflow-hidden bg-black">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="h-full w-full object-cover"
          />

          <canvas
            ref={canvasRef}
            className="hidden"
          />

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative h-64 w-64 rounded-[32px] border-4 border-white">
              <span className="absolute -left-1 -top-1 h-12 w-12 rounded-tl-[28px] border-l-4 border-t-4 border-white" />

              <span className="absolute -right-1 -top-1 h-12 w-12 rounded-tr-[28px] border-r-4 border-t-4 border-white" />

              <span className="absolute -bottom-1 -left-1 h-12 w-12 rounded-bl-[28px] border-b-4 border-l-4 border-white" />

              <span className="absolute -bottom-1 -right-1 h-12 w-12 rounded-br-[28px] border-b-4 border-r-4 border-white" />

              <div className="absolute left-0 right-0 top-1/2 h-0.5 animate-pulse bg-white" />
            </div>
          </div>

          <div
            className="absolute left-0 right-0 top-10 px-6 text-center text-white"
            style={{
              fontFamily:
                'Fanta, sans-serif',
              fontWeight: 400,
            }}
          >
            <h2 className="text-3xl uppercase">
              SCAN THE QR CODE
            </h2>

            <p className="mt-3 text-base uppercase">
              Point your camera at the QR
            </p>
          </div>

          <button
            type="button"
            onClick={stopScanner}
            className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white px-7 py-4 text-black"
            style={{
              fontFamily:
                'Fanta, sans-serif',
              fontWeight: 400,
            }}
          >
            <X size={20} />

            CLOSE
          </button>
        </div>
      )}

      {showModal && qrData && (
        <PrizeModal
          result={{
            status: qrData.type,
            prize: prize?.name,
            clue: qrData.clue,
          }}
          isClaimed={claimed}
          onClose={closeModal}
          onSubmitContact={
            handleClaimContact
          }
          onViewVaultLocations={() => {
            window.location.href = '/vault-locations'
          }}
        />
      )}
    </main>
  )
}

export default PrizeVaultPage