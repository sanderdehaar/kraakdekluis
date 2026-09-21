import { MapPin } from 'lucide-react'

import BaseModal from '../BaseModal/BaseModal'

type VaultLocationModalProps = {
  location: {
    title: string
    name: string
    hint: string
    starterPoint: string
    latitude: number
    longitude: number
    collected: boolean
  }
  onClose: () => void
  onOpenVault: () => void
}

function VaultLocationModal({
  location,
  onClose,
  onOpenVault,
}: VaultLocationModalProps) {
  return (
    <BaseModal onClose={onClose} ariaLabelledBy="location-modal-title">
        <div className="modal-icon">
          {location.collected ? '🔒' : '🔓'}
        </div>

        <h2 id="location-modal-title" className="modal-title">
          {location.title}
        </h2>

        <p className="mt-2 font-bold uppercase tracking-[0.08em] text-[#173bc1]">
          {location.name}
        </p>

        <p className="modal-body modal-body--standalone mt-3 text-center">
          {location.hint}
        </p>

        <a
          href={`https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open ${location.name} in Google Maps`}
          className="modal-prize block cursor-pointer no-underline"
        >
          <strong className="modal-prize__name">
            <span className="flex items-center justify-center gap-2 text-center">
              <MapPin size={20} className="shrink-0" />
              <span>{location.starterPoint}</span>
            </span>
          </strong>
        </a>

        {location.collected ? (
          <button
            type="button"
            className="modal-continue !mt-2 cursor-pointer"
            onClick={onClose}
          >
            ALREADY CLAIMED
          </button>
        ) : (
          <button
            type="button"
            className="modal-continue !mt-2"
            onClick={onOpenVault}
          >
            OPEN VAULT
          </button>
        )}
    </BaseModal>
  )
}

export default VaultLocationModal
