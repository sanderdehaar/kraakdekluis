import { BrowserRouter, Routes, Route } from 'react-router-dom'

import LandingPage from './pages/LandingPage/LandingPage'
import PrizeVaultPage from './pages/PrizeVaultPage/PrizeVaultPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/crack" element={<PrizeVaultPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App