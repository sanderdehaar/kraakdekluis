import './CollaborationLogo.css'

import fantaLogo from '/images/fanta_logo.svg'
import stukLogo from '/images/stuktv_logo.png'

type BrandHeaderProps = {
  variant?: 'default' | 'locations'
}

function BrandHeader({ variant = 'default' }: BrandHeaderProps) {
  return (
    <header className={`collaboration-header ${variant === 'locations' ? 'collaboration-header--locations' : ''}`}>
      <a href="https://www.fanta.nl/" target="_blank" rel="noreferrer" aria-label="Visit Fanta">
        <img
          src={fantaLogo}
          alt="Fanta"
          className="collaboration-header__image collaboration-header__image--fanta"
        />
      </a>

      <span className="collaboration-header__separator">×</span>

      <a href="https://www.stuktv.nl/" target="_blank" rel="noreferrer" aria-label="Visit StukTV">
        <img
          src={stukLogo}
          alt="StukTV"
          className="collaboration-header__image collaboration-header__image--stuk"
        />
      </a>
    </header>
  )
}

export default BrandHeader