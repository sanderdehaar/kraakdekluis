import { useEffect, useState } from 'react'

function useRandomSignal() {
  const [signal, setSignal] = useState(false)

  useEffect(() => {
    let timer: number
    let signalTimer: number

    const schedule = () => {
      timer = window.setTimeout(() => {
        setSignal(true)

        signalTimer = window.setTimeout(() => {
          setSignal(false)
        }, 700 + Math.random() * 700)

        schedule()
      }, 6000 + Math.random() * 7000)
    }

    schedule()

    return () => {
      window.clearTimeout(timer)
      window.clearTimeout(signalTimer)
    }
  }, [])

  return signal
}

export default useRandomSignal