import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import './TV.css'

import tvImg from '/images/screen.png'
import crackImg from '/images/screen2.png'

import useRandomSignal from '../../../hooks/useRandomSignal'
import useMouseTilt from '../../../hooks/useMouseTilt'

type VaultDisplayAnimation =
  | 'idle'
  | 'scanning'
  | 'win'
  | 'fail'
  | 'clue'

type VaultDisplayProps = {
  mode?: 'home' | 'crack'
  animation?: VaultDisplayAnimation
  onPasswordSubmit?: (password: string) => void
}

function VaultDisplay({
  mode = 'home',
  animation = 'idle',
  onPasswordSubmit,
}: VaultDisplayProps) {
  const tvRef = useRef<HTMLDivElement>(null)
  const signal = useRandomSignal()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')

  useMouseTilt(tvRef)

  const isCrack = mode === 'crack'
  const terminalTone = animation === 'fail' ? '#ff3333' : '#32ff32'

  const handleSubmit = () => {
    if (!password.trim()) return
    onPasswordSubmit?.(password.trim())
  }

  return (
    <div ref={tvRef} className={`tv ${signal ? 'tv--signal' : ''}`}>
      <div className="tv__mask">
        <div className="tv__screen">
          <img
            src={isCrack ? crackImg : tvImg}
            alt="Fanta x STUKTV - De Kluis"
            className="tv__image"
            onClick={() => {
              if (!isCrack) navigate('/crack')
            }}
          />

          {isCrack && (
            <div
              className={`tv-terminal ${animation === 'fail' ? 'tv-terminal--fail' : ''}`}
              style={{
                ['--terminal-color' as string]: terminalTone,
              }}
            >
              <div>*** STUKTV X FANTA 2026 ***</div>

              {animation === 'idle' && (
                <>
                  <div>4563 Bytes free</div>
                  <div>Ready.</div>
                  <div className="flex items-center">
                    <span>Enter Password...</span>
                    <input
                      type="text"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') handleSubmit()
                      }}
                      autoComplete="off"
                      spellCheck={false}
                      aria-label="Vault password"
                      className="tv-terminal__input"
                    />
                  </div>
                </>
              )}

              {animation === 'scanning' && (
                <>
                  <div>4563 Bytes free</div>
                  <div>Ready.</div>
                  <div className="mt-2">SCANNING QR CODE...</div>
                  <div>READING DATA...</div>
                  <div>VERIFYING...</div>
                </>
              )}

              {animation === 'win' && (
                <>
                  <div>ACCESS GRANTED</div>
                  <div>VAULT UNLOCKED</div>
                  <div className="mt-2">PRIZE FOUND!</div>
                </>
              )}

              {animation === 'fail' && (
                <>
                  <div>ACCESS DENIED</div>
                  <div>VAULT REMAINS LOCKED</div>
                  <div className="mt-2">NO PRIZE FOUND</div>
                </>
              )}

              {animation === 'clue' && (
                <>
                  <div>ACCESS GRANTED</div>
                  <div>CLUE FOUND</div>
                  <div className="mt-2">KEEP LOOKING...</div>
                </>
              )}
            </div>
          )}

          <div className="crt crt__scanlines" />
          <div className="crt crt__flicker" />
          <div className="crt crt__noise" />
          <div className="crt crt__vignette" />
          <div className="crt crt__glitch" />
          <div className="crt crt__interference" />
        </div>
      </div>
    </div>
  )
}

export default VaultDisplay