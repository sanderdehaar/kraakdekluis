import type { ReactNode } from 'react'

import './PrimaryButton.css'

type ActionButtonProps = {
  children: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

function ActionButton({
  children,
  onClick,
  type = 'button',
}: ActionButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="primary-button"
    >
      {children}
    </button>
  )
}

export default ActionButton