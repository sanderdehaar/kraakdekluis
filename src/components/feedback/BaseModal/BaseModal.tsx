import type { ReactNode } from 'react'

import '../PrizeModal/CrackModal.css'

type BaseModalProps = {
  children: ReactNode
  onClose: () => void
  ariaLabelledBy?: string
}

function BaseModal({ children, onClose, ariaLabelledBy }: BaseModalProps) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="modal-close"
        >
          ×
        </button>

        {children}
      </div>
    </div>
  )
}

export default BaseModal
