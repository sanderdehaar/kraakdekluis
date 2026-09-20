import './CollaborationLogo.css'

import fantaLogo from '/images/fanta_logo.svg'
import stukLogo from '/images/stuktv_logo.png'

function BrandHeader() {
  return (
    <header className="collaboration-header">
      <img
        src={fantaLogo}
        alt="Fanta"
        className="collaboration-header__image collaboration-header__image--fanta"
      />

      <span className="collaboration-header__separator">×</span>

      <img
        src={stukLogo}
        alt="StukTV"
        className="collaboration-header__image collaboration-header__image--stuk"
      />
    </header>
  )
}

export default BrandHeader