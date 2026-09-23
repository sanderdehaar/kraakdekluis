import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { CircleHelp, Minus, Plus, QrCode } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  ComposableMap,
  Geographies,
  Geography,
  Graticule,
  Marker,
  Sphere,
  ZoomableGroup,
} from 'react-simple-maps'
import { feature } from 'topojson-client'
import type { GeometryObject, Topology } from 'topojson-specification'
import worldData from 'world-atlas/countries-50m.json'

import ActionButton from '../../components/buttons/ActionButton/ActionButton'
import VaultLocationModal from '../../components/feedback/VaultLocationModal/VaultLocationModal'
import { db } from '../../firebase'

type VaultLocation = {
  id: string
  code: string
  name: string
  title: string
  description: string
  starterPoint: string
  hint: string
  latitude: number
  longitude: number
  collected: boolean
}

const countries = feature(
  worldData as unknown as Topology,
  worldData.objects.countries as GeometryObject,
)

function VaultLocationsPage() {
  const navigate = useNavigate()
  const [locations, setLocations] = useState<VaultLocation[]>([])
  const [selected, setSelected] = useState<VaultLocation | null>(null)
  const [zoom, setZoom] = useState(0.95)
  const [mapCenter, setMapCenter] = useState<[number, number]>([5.05, 52.2])
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 600px)')
    const updateMobileState = () => setIsMobile(mediaQuery.matches)

    updateMobileState()
    mediaQuery.addEventListener('change', updateMobileState)

    return () => mediaQuery.removeEventListener('change', updateMobileState)
  }, [])

  function focusLocations(nextLocations: VaultLocation[]) {
    if (nextLocations.length === 0) return

    const center = nextLocations.reduce(
      (current, location) => [
        current[0] + location.longitude / nextLocations.length,
        current[1] + location.latitude / nextLocations.length,
      ],
      [0, 0],
    ) as [number, number]

    setMapCenter(center)
    setZoom(isMobile ? 1.55 : 1.15)
  }

  useEffect(() => {
    async function loadLocations() {
      try {
        const snapshot = await getDocs(collection(db, 'qrCodes'))

        const databaseLocations = snapshot.docs
          .map((document) => {
            const data = document.data() as Record<string, unknown>
            const code = document.id.toUpperCase()

            return {
              id: document.id,
              code,
              name:
                typeof data.name === 'string'
                  ? data.name
                  : `Vault ${code.slice(-3)}`,
              title:
                typeof data.title === 'string'
                  ? data.title
                  : 'UNIDENTIFIED VAULT',
              description:
                typeof data.description === 'string'
                  ? data.description
                  : 'Location intelligence is still being decoded.',
              starterPoint:
                typeof data.starterPoint === 'string'
                  ? data.starterPoint
                  : 'Starter point is still being decoded.',
              hint:
                typeof data.hint === 'string'
                  ? data.hint
                  : 'The next signal is waiting somewhere nearby.',
              latitude: data.latitude,
              longitude: data.longitude,
              collected:
                data.collected === true || data.claimed === true,
            }
          })
          .filter(
            (location) =>
              typeof location.latitude === 'number' &&
              typeof location.longitude === 'number',
          ) as VaultLocation[]

        setLocations(databaseLocations)
        setSelected(null)
        focusLocations(databaseLocations)
      } catch (error) {
        console.error('Failed to load vault locations:', error)
        setLocations([])
        setSelected(null)
      }
    }

    loadLocations()
  }, [])

  const collectedCount = locations.filter(
    (location) => location.collected,
  ).length

  const markerSize = isMobile ? 82 : 46

  const markerScale = isMobile
    ? Math.min(1, Math.max(0.24, 0.98 / Math.pow(zoom, 1.2)))
    : Math.min(1, Math.max(0.16, 0.82 / Math.pow(zoom, 1.35)))

  const minimumZoom = isMobile ? 1.3 : 0.8

  return (
    <main className="relative h-[100svh] w-full overflow-hidden bg-[#1976d2] font-['Fanta',sans-serif] text-[#061a37]">
      <div className="absolute inset-0 z-0 bg-[#1976d2]">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            center: [5.05, 52.2],
            scale: 4000,
          }}
          className="h-full w-full"
        >
          <Sphere
            stroke="#ffffff"
            strokeWidth={1.2}
            fill="#1976d2"
          />

          <Graticule
            stroke="#ffffff"
            strokeWidth={0.45}
            opacity={0.32}
          />

          <ZoomableGroup
            center={mapCenter}
            zoom={zoom}
            minZoom={minimumZoom}
            maxZoom={12}
            onMoveEnd={({ zoom: nextZoom, coordinates }) => {
              setZoom(nextZoom ?? zoom)
              setMapCenter(coordinates ?? mapCenter)
            }}
          >
            <Geographies geography={countries}>
              {({ geographies }) =>
                geographies.map((geography) => (
                  <Geography
                    key={geography.rsmKey}
                    geography={geography}
                    className="outline-none transition-colors duration-200"
                    style={{
                      default: {
                        fill:
                          geography.properties?.name === 'Netherlands'
                            ? '#0b4e91'
                            : geography.rsmKey.endsWith('0')
                              ? '#1976d2'
                              : '#2b83d8',
                        stroke: '#ffffff',
                        strokeWidth: 0.85,
                        outline: 'none',
                      },
                      hover: {
                        fill: '#ff7f00',
                        stroke: '#ffffff',
                        strokeWidth: 1.15,
                        outline: 'none',
                      },
                      pressed: {
                        fill: '#ff7f00',
                        stroke: '#ffffff',
                        strokeWidth: 1.15,
                        outline: 'none',
                      },
                    } as unknown as CSSProperties}
                  />
                ))
              }
            </Geographies>

            {locations.map((location) => (
              <Marker
                key={location.id}
                coordinates={[
                  location.longitude,
                  location.latitude,
                ]}
              >
                <g
                  role="button"
                  tabIndex={0}
                  aria-label={`Open ${location.name} vault`}
                  onClick={() => setSelected(location)}
                  onKeyDown={(event) => {
                    if (
                      event.key === 'Enter' ||
                      event.key === ' '
                    ) {
                      setSelected(location)
                    }
                  }}
                  transform={`scale(${markerScale})`}
                  className={`cursor-pointer outline-none ${
                    location.collected
                      ? ''
                      : 'hover:scale-110'
                  }`}
                >
                  {selected?.id === location.id && (
                    <circle
                      r={markerSize * 0.67}
                      fill="none"
                      stroke="#ff7f00"
                      strokeWidth={2.5}
                      strokeDasharray="7 4"
                      opacity={0.95}
                      className={
                        location.collected
                          ? ''
                          : 'animate-pulse'
                      }
                    />
                  )}

                  <image
                    href={
                      location.collected
                        ? '/images/thief_icon.svg'
                        : '/images/vault_icon.svg'
                    }
                    x={-markerSize / 2}
                    y={-markerSize / 2}
                    width={markerSize}
                    height={markerSize}
                  />
                </g>
              </Marker>
            ))}
          </ZoomableGroup>
        </ComposableMap>
      </div>

      <div className="pointer-events-none absolute inset-0 z-[1] bg-[rgba(0,98,190,0.16)] mix-blend-screen" />

      <div className="absolute bottom-[30px] right-[30px] z-10 flex gap-2 max-[600px]:bottom-5 max-[600px]:right-5">
        <ActionButton
          className="primary-button--static !h-[74px] !w-[74px] !rounded-[10px] !border-2 !border-[#173bc1] !bg-[#173bc1] !p-0 !text-xl !text-white !shadow-[0_10px_25px_rgba(0,0,0,0.18)] max-[600px]:!h-14 max-[600px]:!w-14"
          onClick={() =>
            setZoom((current) =>
              Math.min(12, current + 0.75),
            )
          }
        >
          <Plus size={23} strokeWidth={2} />
        </ActionButton>

        <ActionButton
          className="primary-button--static !h-[74px] !w-[74px] !rounded-[10px] !border-2 !border-[#173bc1] !bg-[#173bc1] !p-0 !text-xl !text-white !shadow-[0_10px_25px_rgba(0,0,0,0.18)] max-[600px]:!h-14 max-[600px]:!w-14"
          onClick={() =>
            setZoom((current) =>
              Math.max(minimumZoom, current - 0.5),
            )
          }
          disabled={zoom <= minimumZoom}
          ariaLabel="Zoom out"
        >
          <Minus size={23} strokeWidth={2} />
        </ActionButton>
      </div>

      <header className="pointer-events-none absolute left-[clamp(24px,5vw,72px)] top-[clamp(28px,6vh,65px)] z-[5] text-white drop-shadow-[0_2px_0_rgba(255,255,255,0.22)]">
        <h1 className="m-0 text-[clamp(42px,6vw,88px)] leading-[0.84] tracking-[0.01em]">
          VAULT
          <br />
          <span className="text-[#ff7f00]">
            LOCATIONS
          </span>
        </h1>

        <p className="m-0 text-[18px] font-bold tracking-[0.12em] text-white drop-shadow-[0_1px_4px_rgba(0,25,70,0.5)] max-[600px]:text-[15px]">
          {locations.length} VAULTS / {collectedCount} VAULTS CRACKED
        </p>
      </header>

      <div className="absolute right-[30px] top-[28px] z-20 max-[600px]:right-5 max-[600px]:top-6">
        <ActionButton
          className="primary-button--static !rounded-[10px] !border-2 !border-[#173bc1] !bg-[#173bc1] !px-12 !py-5 !text-xl !text-white !shadow-[0_10px_25px_rgba(0,0,0,0.18)] max-[600px]:!h-14 max-[600px]:!w-14 max-[600px]:!p-0"
          onClick={() => {}}
        >
          <CircleHelp size={23} />
          <span className="max-[600px]:hidden">
            HELP
          </span>
        </ActionButton>
      </div>

      {selected && (
        <VaultLocationModal
          location={selected}
          onClose={() => setSelected(null)}
          onOpenVault={() => navigate('/crack')}
        />
      )}

    <div className="absolute bottom-[10vh] left-[140px] z-10 max-[600px]:bottom-[9vh] max-[600px]:left-5">
      <img
        src="/images/go_back.svg"
        alt="Go back"
        className="h-30 w-30 max-[600px]:h-22 max-[600px]:w-22"
      />
    </div>

      <div className="absolute bottom-[30px] left-[30px] z-10 max-[600px]:bottom-5 max-[600px]:left-5">
        <ActionButton
          onClick={() => navigate('/crack')}
          className="!rounded-[10px] !border-2 !border-[#173bc1] !bg-[#173bc1] !px-12 !py-5 !text-xl !text-white !shadow-[0_10px_25px_rgba(0,0,0,0.18)] max-[600px]:!h-14 max-[600px]:!w-14 max-[600px]:!p-0"
        >
          <QrCode size={23} strokeWidth={2} />
          <span className="max-[600px]:hidden">
            SCAN QR
          </span>
        </ActionButton>
      </div>
    </main>
  )
}

export default VaultLocationsPage