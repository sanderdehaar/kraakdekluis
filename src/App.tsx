import { BrowserRouter, Routes, Route } from 'react-router-dom'

import LandingPage from './pages/LandingPage/LandingPage'
import PrizeVaultPage from './pages/PrizeVaultPage/PrizeVaultPage'
import VaultLocationsPage from './pages/VaultLocationsPage/VaultLocationsPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/crack" element={<PrizeVaultPage />} />
        <Route path="/vault-locations" element={<VaultLocationsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App