import '../../styles/page.css'

import BrandHeader from '../../components/layout/BrandHeader/BrandHeader'
import LegalNotice from '../../components/layout/LegalNotice/LegalNotice'
import VaultDisplay from '../../components/media/VaultDisplay/VaultDisplay'

function LandingPage() {
  return (
    <main className="page">
      <BrandHeader />
      <VaultDisplay />
      <LegalNotice />
    </main>
  )
}

export default LandingPage