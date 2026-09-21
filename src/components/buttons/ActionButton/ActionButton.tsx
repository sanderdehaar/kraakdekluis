import type { ReactNode } from 'react'

import './PrimaryButton.css'

type ActionButtonProps = {
  children: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  className?: string
  disabled?: boolean
  ariaLabel?: string
}

function ActionButton({
  children,
  onClick,
  type = 'button',
  className = '',
  disabled = false,
  ariaLabel,
}: ActionButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`primary-button ${className}`}
    >
      {children}
    </button>
  )
}

export default ActionButton